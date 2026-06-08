import { Response } from 'express';
import {
  getBedrockClient,
  DEFAULT_MODEL_ID,
  InvokeModelWithResponseStreamCommand,
} from '../../lib/bedrock';
import { supabaseAdmin } from '../../lib/supabase';
import { getSystemPrompt, SECTION_EDIT_SUFFIX } from './prompt';
import { GenerateRequestBody } from './generate.types';
import { hasTailwindClasses, injectTailwindCSS } from '../../lib/tailwindCompiler';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function buildUserMessage(body: GenerateRequestBody): string {
  let message = body.prompt.trim().slice(0, 2000);
  if (body.sectionId && body.currentHtml) {
    message =
      `Current full page HTML:\n\`\`\`html\n${body.currentHtml}\n\`\`\`\n\n${message}` +
      SECTION_EDIT_SUFFIX(body.sectionId, body.prompt.trim());
  }
  return message;
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

// ─── FORCE STRIP ALL EXTERNAL CDN / FONT LINKS ───────────────────────────────
// AI prompt rules ko ignore karta hai — yahan HARD remove karo (every CDN blocked)
function stripExternalResources(html: string): string {
  return html
    // Remove ALL <script src="https://..."> — paired or self-closing
    .replace(/<script[^>]+src=["']https?:\/\/[^"']+["'][^>]*>(<\/script>)?/gi, '')
    // Remove ALL <link href="https://..."> — any rel, self-closing or not
    .replace(/<link[^>]+href=["']https?:\/\/[^"']+["'][^>]*\/?>/gi, '')
    // Remove ALL @import url('https://...') — any domain (Google Fonts, unpkg, etc.)
    .replace(/@import\s+url\(['"]?https?:\/\/[^)]+['"]?\)\s*;?/gi, '')
    // Remove ALL @import "https://..." or @import 'https://...' (without url())
    .replace(/@import\s+["']https?:\/\/[^"']+["']\s*;?/gi, '')
    // Remove placeholder image srcs (picsum, placehold, via.placeholder)
    .replace(/src=["']https?:\/\/(via\.placeholder|picsum\.photos|placehold)\.[a-z]+[^"']*["']/gi, 'src=""');
}

// ─── Core streaming call ──────────────────────────────────────────────────────
async function streamBedrockResponse(
  userMessage: string,
  framework: string | undefined,
  res: Response
): Promise<string> {
  const client = getBedrockClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS * attempt);
      sendSSE(res, 'retry', { attempt, maxRetries: MAX_RETRIES });
    }

    try {
      const payload = {
        messages: [{ role: 'user', content: [{ text: userMessage }] }],
        inferenceConfig: { maxTokens: 8192, temperature: 0.7, topP: 0.9 },
        system: [{ text: getSystemPrompt(framework) }],
      };

      const command = new InvokeModelWithResponseStreamCommand({
        modelId: DEFAULT_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await client.send(command);
      if (!response.body) throw new Error('Bedrock returned an empty response body.');

      let accumulated = '';
      let isFirstChunk = true;
      let fenceBuffer = '';
      let fenceStripped = false;

      for await (const event of response.body) {
        if (event.chunk?.bytes) {
          const decoded = new TextDecoder().decode(event.chunk.bytes);
          let parsed: unknown;
          try { parsed = JSON.parse(decoded); } catch { continue; }

          const text = extractTextDelta(parsed);
          if (text) {
            let cleanText = text;

            if (isFirstChunk && !fenceStripped) {
              fenceBuffer += text;
              if (fenceBuffer.length >= 10 || fenceBuffer.includes('<')) {
                cleanText = fenceBuffer
                  .replace(/^```html\s*/i, '')
                  .replace(/^```\s*/i, '');
                fenceStripped = true;
                isFirstChunk = false;
                fenceBuffer = '';
              } else {
                continue;
              }
            }

            accumulated += cleanText;
            // Strip CDN links from each chunk before sending to client
            const safeChunk = stripExternalResources(cleanText);
            if (safeChunk.trim()) {
              sendSSE(res, 'chunk', { text: safeChunk });
            }
          }
        }
      }

      // Strip code fences + force-remove all remaining CDN links
      let cleaned = stripExternalResources(stripCodeFences(accumulated));

      // If AI still used Tailwind classes, generate CSS server-side (no CDN)
      if (hasTailwindClasses(cleaned)) {
        console.log('[generate.service] Tailwind classes detected — compiling CSS server-side...');
        cleaned = await injectTailwindCSS(cleaned);
      }

      return cleaned;

    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isTransient =
        lastError.message.includes('ThrottlingException') ||
        lastError.message.includes('ServiceUnavailableException') ||
        lastError.message.includes('InternalServerException') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNRESET');
      if (!isTransient || attempt === MAX_RETRIES) throw lastError;
    }
  }

  throw lastError ?? new Error('Streaming failed after retries.');
}

function extractTextDelta(event: unknown): string {
  if (typeof event !== 'object' || event === null) return '';
  const ev = event as Record<string, unknown>;
  if (ev.contentBlockDelta) {
    const delta = (ev.contentBlockDelta as Record<string, unknown>).delta as Record<string, unknown> | undefined;
    if (delta?.text && typeof delta.text === 'string') return delta.text;
  }
  if (ev.delta) {
    const delta = ev.delta as Record<string, unknown>;
    if (delta.text && typeof delta.text === 'string') return delta.text;
    if (delta.type === 'text_delta' && typeof delta.text === 'string') return delta.text;
  }
  if (ev.outputText && typeof ev.outputText === 'string') return ev.outputText;
  return '';
}

async function saveGenerationRecord(
  projectId: string,
  prompt: string,
  output: string,
  isSectionEdit: boolean,
  sectionId: string | null
): Promise<void> {
  const { error } = await supabaseAdmin.from('generations').insert({
    project_id: projectId,
    prompt,
    output,
    is_section_edit: isSectionEdit,
    section_id: sectionId ?? null,
  });
  if (error) {
    console.error('[generate.service] Failed to save generation record:', error.message);
  }
}

export async function generateAndStream(
  body: GenerateRequestBody,
  res: Response
): Promise<void> {
  const userMessage = buildUserMessage(body);
  const fullHtml = await streamBedrockResponse(userMessage, body.framework, res);

  saveGenerationRecord(
    body.projectId,
    body.prompt.trim(),
    fullHtml,
    !!body.sectionId,
    body.sectionId ?? null
  ).catch((err) => console.error('[generate.service] saveGenerationRecord error:', err));

  sendSSE(res, 'done', { html: fullHtml });
}