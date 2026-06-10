// server/src/features/generate/generate.service.ts (complete fixed version)

import { Response } from 'express';
import { getBedrockClient, DEFAULT_MODEL_ID, InvokeModelWithResponseStreamCommand } from '../../lib/bedrock';
import { supabaseAdmin } from '../../lib/supabase';
import { getSystemPrompt } from './prompt'; // no longer need SECTION_EDIT_SUFFIX
import { GenerateRequestBody } from './generate.types';
import { hasTailwindClasses, injectTailwindCSS } from '../../lib/tailwindCompiler';

const MAX_RETRIES = 2;
const MAX_CORRECTION_ATTEMPTS = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── FIXED: buildUserMessage with stronger edit instruction ─────────────────
function buildUserMessage(body: GenerateRequestBody): string {
  const basePrompt = body.prompt.trim().slice(0, 2000);
  
  if (body.sectionId && body.currentHtml) {
    return `
## CURRENT FULL PAGE HTML (reference only)
\`\`\`html
${body.currentHtml}
\`\`\`

## SECTION EDITING MODE (strict)
- Section to edit: data-section-id="${body.sectionId}"
- Edit request: "${basePrompt}"
- **CRITICAL RULES**:
  1. Output the COMPLETE HTML page.
  2. Change ONLY the section with data-section-id="${body.sectionId}".
  3. Every other section must be **EXACTLY** as shown above – same content, attributes, order.
  4. Do NOT add, remove, or modify any other element.
  5. If you change anything else, the user will reject the output.
`;
  }
  
  return basePrompt;
}

// ─── Strip markdown code fences ──────────────────────────────────────────────
function stripCodeFences(text: string): string {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

// ─── Force remove any external CDN / font links ─────────────────────────────
function stripExternalResources(html: string): string {
  let cleaned = html
    .replace(/<script[^>]+src=["']https?:\/\/[^"']+["'][^>]*>(<\/script>)?/gi, '')
    .replace(/<link[^>]+href=["']https?:\/\/[^"']+["']*\/?>/gi, '')
    .replace(/@import\s+url\(['"]?https?:\/\/[^)]+['"]?\)\s*;?/gi, '')
    .replace(/@import\s+['"]https?:\/\/[^'"]+['"]\s*;?/gi, '')
    .replace(/src=["']https?:\/\/(via\.placeholder|picsum\.photos|placehold)\.[a-z]+[^"']*["']/gi, 'src=""');
  cleaned = cleaned.replace(/darken\(([^,]+),\s*(\d+)%\)/gi, (_, color, pct) => {
    const mixPct = 100 - parseInt(pct, 10);
    return `color-mix(in srgb, ${color.trim()} ${mixPct}%, black)`;
  });
  cleaned = cleaned.replace(/lighten\(([^,]+),\s*(\d+)%\)/gi, (_, color, pct) => {
    const mixPct = 100 - parseInt(pct, 10);
    return `color-mix(in srgb, ${color.trim()} ${mixPct}%, white)`;
  });
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(/\.(navbar|hero|features|benefits|testimonials|faq|contact|footer|item)\.([a-zA-Z0-9_-]+)/gi, '.$1 .$2');
  }
  return cleaned;
}

// ─── HTML validation ─────────────────────────────────────────────────────────
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateHtml(html: string): ValidationResult {
  const errors: string[] = [];
  const openDivs = (html.match(/<div[^>]*>/gi) || []).length;
  const closeDivs = (html.match(/<\/div>/gi) || []).length;
  if (openDivs !== closeDivs) {
    errors.push(`Unclosed <div> tags: opened ${openDivs}, closed ${closeDivs}`);
  }
  const loremPattern = /lorem\s+ipsum|dolor\s+sit\s+amet|placeholder\s+image|via\.placeholder|picsum/i;
  if (loremPattern.test(html)) {
    errors.push('Contains placeholder text or images. Replace with realistic content.');
  }
  const requiredSections = ['navbar', 'hero', 'features', 'benefits', 'testimonials', 'faq', 'contact', 'footer'];
  const missing = requiredSections.filter(section => !html.includes(`data-section-id="${section}"`));
  if (missing.length) {
    errors.push(`Missing mandatory sections: ${missing.join(', ')}`);
  }
  const cdnPattern = /https?:\/\/(cdn|unpkg|jsdelivr|fonts\.google|use\.fontawesome|tailwindcss)/i;
  if (cdnPattern.test(html)) {
    errors.push('External CDN links still present.');
  }
  const tailwindPattern = /\bclass="[^"]*(?:bg-|text-|mt-|mb-|ml-|mr-|pt-|pb-|pl-|pr-|flex|grid|rounded-|shadow-|border-|hover:)[^"]*"/i;
  if (tailwindPattern.test(html)) {
    errors.push('Tailwind CSS classes detected.');
  }
  return { isValid: errors.length === 0, errors };
}

// ─── Self‑correction ────────────────────────────────────────────────────────
async function correctWithLLM(
  invalidHtml: string,
  validationErrors: string[],
  originalPrompt: string,
  framework: string | undefined,
  res: Response
): Promise<string> {
  const correctionPrompt = `
The previous generated HTML has validation errors:
${validationErrors.join('\n')}

Original request: "${originalPrompt}"

Here is the invalid HTML:
\`\`\`html
${invalidHtml}
\`\`\`

Please fix ALL the errors listed above. Output ONLY the corrected HTML (no markdown, no explanations). Make sure to:
- Close any unclosed tags.
- Replace placeholder text with realistic, compelling copy.
- Include all mandatory sections.
- Remove any external CDN links and Tailwind classes.
- Keep the design beautiful and modern.

Output only the fixed HTML. First character must be <.
`;
  sendSSE(res, 'correcting', { attempt: 1, message: 'Fixing validation errors...' });
  const fixedHtml = await streamBedrockResponse(correctionPrompt, framework, res);
  return fixedHtml;
}

// ─── Core streaming call ────────────────────────────────────────────────────
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
                cleanText = fenceBuffer.replace(/^```html\s*/i, '').replace(/^```\s*/i, '');
                fenceStripped = true;
                isFirstChunk = false;
                fenceBuffer = '';
              } else {
                continue;
              }
            }
            accumulated += cleanText;
            const safeChunk = stripExternalResources(cleanText);
            if (safeChunk.trim()) {
              sendSSE(res, 'chunk', { text: safeChunk });
            }
          }
        }
      }

      let finalHtml = stripExternalResources(stripCodeFences(accumulated));
      if (hasTailwindClasses(finalHtml)) {
        console.log('[generate.service] Tailwind classes detected — compiling CSS server-side...');
        finalHtml = await injectTailwindCSS(finalHtml);
      }

      return finalHtml;

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

// ─── Main exported function ─────────────────────────────────────────────────
export async function generateAndStream(
  body: GenerateRequestBody,
  res: Response
): Promise<void> {
  const userMessage = buildUserMessage(body);
  let currentHtml = await streamBedrockResponse(userMessage, body.framework, res);

  // Self‑correction loop
  for (let correctionAttempt = 0; correctionAttempt < MAX_CORRECTION_ATTEMPTS; correctionAttempt++) {
    const validation = validateHtml(currentHtml);
    if (validation.isValid) break;
    console.log(`[generate.service] Validation failed (attempt ${correctionAttempt + 1}):`, validation.errors);
    sendSSE(res, 'validation_failed', { errors: validation.errors, attempt: correctionAttempt + 1 });
    currentHtml = await correctWithLLM(currentHtml, validation.errors, body.prompt, body.framework, res);
  }

  const finalValidation = validateHtml(currentHtml);
  if (!finalValidation.isValid) {
    console.warn('[generate.service] Final HTML still has validation issues:', finalValidation.errors);
    sendSSE(res, 'warning', { message: 'Generated HTML has minor issues, but delivery continues.', errors: finalValidation.errors });
  }

  await saveGenerationRecord(
    body.projectId,
    body.prompt.trim(),
    currentHtml,
    !!body.sectionId,
    body.sectionId ?? null
  ).catch((err) => console.error('[generate.service] save error:', err));

  sendSSE(res, 'done', { html: currentHtml, validation: finalValidation });
}