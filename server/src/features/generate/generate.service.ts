import { Response } from 'express';
import {
  getBedrockClient,
  DEFAULT_MODEL_ID,
  InvokeModelWithResponseStreamCommand,
} from '../../lib/bedrock';
import { supabaseAdmin } from '../../lib/supabase';
import { SYSTEM_PROMPT, SECTION_EDIT_SUFFIX } from './prompt';
import { GenerateRequestBody } from './generate.types';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Write an SSE event to the response stream.
 */
function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Build the user message string sent to the model.
 */
function buildUserMessage(body: GenerateRequestBody): string {
  let message = body.prompt.trim().slice(0, 2000);

  if (body.sectionId && body.currentHtml) {
    message =
      `Current full page HTML:\n\`\`\`html\n${body.currentHtml}\n\`\`\`\n\n${message}` +
      SECTION_EDIT_SUFFIX(body.sectionId, body.prompt.trim());
  }

  return message;
}

// ─── Core streaming call ─────────────────────────────────────────────────────

/**
 * Calls Bedrock with retry logic (up to MAX_RETRIES attempts on transient errors).
 * Streams tokens via SSE to the client response.
 * Returns the full accumulated HTML string.
 */
async function streamBedrockResponse(
  userMessage: string,
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
        messages: [
          {
            role: 'user',
            content: [{ text: userMessage }],
          },
        ],
        inferenceConfig: {
          maxTokens: 8192,
          temperature: 0.7,
          topP: 0.9,
        },
        system: [{ text: SYSTEM_PROMPT }],
      };

      const command = new InvokeModelWithResponseStreamCommand({
        modelId: DEFAULT_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await client.send(command);

      if (!response.body) {
        throw new Error('Bedrock returned an empty response body.');
      }

      let accumulated = '';

      for await (const event of response.body) {
        if (event.chunk?.bytes) {
          const decoded = new TextDecoder().decode(event.chunk.bytes);

          let parsed: unknown;
          try {
            parsed = JSON.parse(decoded);
          } catch {
            // Non-JSON chunk — skip
            continue;
          }

          const text = extractTextDelta(parsed);

          if (text) {
            accumulated += text;
            sendSSE(res, 'chunk', { text });
          }
        }
      }

      return accumulated;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const isTransient =
        lastError.message.includes('ThrottlingException') ||
        lastError.message.includes('ServiceUnavailableException') ||
        lastError.message.includes('InternalServerException') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNRESET');

      if (!isTransient || attempt === MAX_RETRIES) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error('Streaming failed after retries.');
}

/**
 * Extracts the text delta from a Bedrock streaming event payload.
 * Supports Amazon Nova Pro and Claude Bedrock response formats.
 */
function extractTextDelta(event: unknown): string {
  if (typeof event !== 'object' || event === null) return '';

  const ev = event as Record<string, unknown>;

  // Nova Pro / Converse streaming format
  if (ev.contentBlockDelta) {
    const delta = (ev.contentBlockDelta as Record<string, unknown>)
      .delta as Record<string, unknown> | undefined;
    if (delta?.text && typeof delta.text === 'string') return delta.text;
  }

  // Alternative streaming format (some models)
  if (ev.delta) {
    const delta = ev.delta as Record<string, unknown>;
    if (delta.text && typeof delta.text === 'string') return delta.text;
    if (delta.type === 'text_delta' && typeof delta.text === 'string')
      return delta.text;
  }

  // Inline text response
  if (ev.outputText && typeof ev.outputText === 'string') return ev.outputText;

  return '';
}

// ─── DB persistence ───────────────────────────────────────────────────────────

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
    // Log but don't fail the request — generation already succeeded
    console.error(
      '[generate.service] Failed to save generation record:',
      error.message
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Stream an LLM generation to the SSE response and persist it to the DB.
 */
export async function generateAndStream(
  body: GenerateRequestBody,
  res: Response
): Promise<void> {
  const userMessage = buildUserMessage(body);

  const fullHtml = await streamBedrockResponse(userMessage, res);

  // Persist the generation record (fire-and-forget — non-blocking)
  saveGenerationRecord(
    body.projectId,
    body.prompt.trim(),
    fullHtml,
    !!body.sectionId,
    body.sectionId ?? null
  ).catch((err) =>
    console.error('[generate.service] saveGenerationRecord error:', err)
  );

  // Signal completion to the client
  sendSSE(res, 'done', { html: fullHtml });
}
