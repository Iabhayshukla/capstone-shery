import { Response } from 'express';
import { getBedrockClient, DEFAULT_MODEL_ID, InvokeModelWithResponseStreamCommand } from '../../lib/bedrock';
import { supabaseAdmin } from '../../lib/supabase';
import { getSystemPrompt, SECTION_EDIT_SYSTEM_PROMPT } from './prompt';
import { GenerateRequestBody } from './generate.types';
import { hasTailwindClasses, injectTailwindCSS } from '../../lib/tailwindCompiler';
import { recordTokenUsage } from '../usage/usage.service';

const MAX_RETRIES = 2;
const MAX_CORRECTION_ATTEMPTS = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── Section helpers ────────────────────────────────────────────────────────
function extractSection(html: string, sectionId: string): string | null {
  const regex = new RegExp(
    `<([a-zA-Z0-9]+)[^>]*data-section-id="${sectionId}"[^>]*>([\\s\\S]*?)<\\/\\1>`,
    'i'
  );
  const match = html.match(regex);
  return match ? match[0] : null;
}

function replaceSection(html: string, sectionId: string, newSection: string): string {
  const regex = new RegExp(
    `<([a-zA-Z0-9]+)[^>]*data-section-id="${sectionId}"[^>]*>([\\s\\S]*?)<\\/\\1>`,
    'i'
  );
  return html.replace(regex, newSection);
}

// ─── History formatting ─────────────────────────────────────────────────────
type CallType = 'full-page' | 'section-edit' | 'correction';

function formatHistory(history: { role: 'user' | 'assistant'; content: string }[]): string {
  if (!history || history.length === 0) return '';
  // Keep last 6 messages (3 turns) — enough context without burning tokens
  const recent = history.slice(-6);
  return recent.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
}

// ─── User message builder ────────────────────────────────────────────────────
function buildUserMessage(body: GenerateRequestBody): string {
  const basePrompt = body.prompt.trim().slice(0, 2000);
  // Section edits don't need conversation history — the section HTML is full context
  const isSectionEdit = !!(body.sectionId && body.currentHtml);
  const historyContext = (!isSectionEdit && body.conversationHistory)
    ? `## PREVIOUS CONVERSATION\n${formatHistory(body.conversationHistory)}\n\n---\n\n`
    : '';

  if (body.sectionId && body.currentHtml) {
    const sectionHtml = extractSection(body.currentHtml, body.sectionId);

    if (!sectionHtml) {
      console.warn(`[generate.service] Section "${body.sectionId}" not found – falling back to full page.`);
      return `${historyContext}## CURRENT FULL PAGE HTML (reference only)
\`\`\`html
${body.currentHtml}
\`\`\`

## SECTION EDITING MODE (fallback)
- Section to edit: data-section-id="${body.sectionId}"
- Edit request: "${basePrompt}"
- **CRITICAL RULES**: ...`;
    }

    return `${historyContext}## SECTION EDIT MODE (strict)

Current section HTML:
\`\`\`html
${sectionHtml}
\`\`\`

Edit request: "${basePrompt}"

**CRITICAL RULES**:
1. Output ONLY the updated section HTML, keeping the same data-section-id="${body.sectionId}" and all other root attributes.
2. Do NOT output the full page. Only the section element.
3. No markdown fences, no explanations, no extra text. First character must be <, last character must be >.
`;
  }

  // Full-page follow-up edit: send the current HTML so the LLM modifies it
  // instead of generating a brand-new page from scratch (which resets all CSS).
  // 30 000 chars covers any typical 8-section page; Nova Pro's context window is 300K tokens.
  if (body.currentHtml) {
    const MAX_HTML_CHARS = 30_000;
    const isTruncated = body.currentHtml.length > MAX_HTML_CHARS;
    const truncatedHtml = body.currentHtml.slice(0, MAX_HTML_CHARS);
    const truncationNote = isTruncated
      ? '\n\n> NOTE: The HTML above was truncated for context length. Make sure the full output still includes ALL mandatory sections (navbar, hero, features, benefits, testimonials, faq, contact, footer).'
      : '';
    return `${historyContext}## CURRENT PAGE HTML (modify this — do NOT start from scratch)\n\`\`\`html\n${truncatedHtml}\n\`\`\`${truncationNote}\n\n## EDIT REQUEST\n"${basePrompt}"\n\n**RULES**:\n1. Output the FULL updated page HTML with the requested changes applied.\n2. Preserve all sections, content, and CSS that the user did NOT ask to change.\n3. No markdown fences, no explanations. First character must be <, last character must be >.`;
  }

  return `${historyContext}${basePrompt}`;
}

// ─── Cleaners ───────────────────────────────────────────────────────────────
function stripCodeFences(text: string): string {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

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

function removeHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// ─── Validation (full‑page only) ────────────────────────────────────────────
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

// ─── Self‑correction (returns token info) ────────────────────────────────────
async function correctWithLLM(
  invalidHtml: string,
  validationErrors: string[],
  originalPrompt: string,
  framework: string | undefined,
  res: Response,
  attempt: number = 1
): Promise<{ html: string; inputTokens: number; outputTokens: number }> {
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
- Write the minimum lines of code possible.

Output only the fixed HTML. First character must be <.
`;
  sendSSE(res, 'correcting', { attempt, message: `Fixing validation errors (attempt ${attempt})...` });
  return await streamBedrockResponse(correctionPrompt, framework, res, undefined, 'correction');
}

// ─── Inference config per call type ────────────────────────────────────────
function getInferenceConfig(callType: CallType) {
  switch (callType) {
    case 'section-edit':
      // Small output, deterministic — tightly capped
      return { maxTokens: 2048, temperature: 0.3, topP: 0.85 };
    case 'correction':
      // Needs to fix specific errors deterministically, not explore creatively
      return { maxTokens: 8192, temperature: 0.3, topP: 0.85 };
    case 'full-page':
    default:
      // Creative full-page generation
      return { maxTokens: 8192, temperature: 0.7, topP: 0.9 };
  }
}

// ─── Core streaming call (returns token counts) ──────────────────────────────
async function streamBedrockResponse(
  userMessage: string,
  framework: string | undefined,
  res: Response,
  systemPromptOverride?: string,
  callType: CallType = 'full-page'
): Promise<{ html: string; inputTokens: number; outputTokens: number }> {
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
        inferenceConfig: getInferenceConfig(callType),
        system: [{ text: systemPromptOverride ?? getSystemPrompt(framework) }],
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
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const event of response.body) {
        if (res.destroyed) {
          console.log('[generate.service] Client disconnected. Aborting generation stream.');
          throw new Error('Client disconnected');
        }
        if (event.chunk?.bytes) {
          const decoded = new TextDecoder().decode(event.chunk.bytes);
          let parsed: unknown;
          try { parsed = JSON.parse(decoded); } catch { continue; }

          // 1. Capture token usage from Converse metadata/usage format
          if (parsed && (parsed as any).metadata?.usage) {
            const usage = (parsed as any).metadata.usage;
            inputTokens = usage.inputTokens ?? 0;
            outputTokens = usage.outputTokens ?? 0;
            console.log(`[generate.service] Captured Converse usage: input=${inputTokens}, output=${outputTokens}`);
          }

          // 2. Capture token usage from amazon-bedrock-invocationMetrics format
          const metrics = (parsed as any)['amazon-bedrock-invocationMetrics'] || 
                          (parsed as any).metadata?.['amazon-bedrock-invocationMetrics'] ||
                          (parsed as any).messageStop?.['amazon-bedrock-invocationMetrics'] ||
                          (parsed as any).message_stop?.['amazon-bedrock-invocationMetrics'];
          if (metrics) {
            inputTokens = metrics.inputTokenCount ?? 0;
            outputTokens = metrics.outputTokenCount ?? 0;
            console.log(`[generate.service] Captured InvocationMetrics: input=${inputTokens}, output=${outputTokens}`);
          }

          if ((parsed as any).type === 'message_stop' || (parsed as any).messageStop || (parsed as any).metadata) {
            continue;
          }

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
      finalHtml = removeHtmlComments(finalHtml);
      if (hasTailwindClasses(finalHtml)) {
        console.log('[generate.service] Tailwind classes detected — compiling CSS server-side...');
        finalHtml = await injectTailwindCSS(finalHtml);
      }

      return { html: finalHtml, inputTokens, outputTokens };

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
  userId: string,
  res: Response
): Promise<void> {
  const userMessage = buildUserMessage(body);
  const isSectionEdit = !!(body.sectionId && body.currentHtml);

  const systemPrompt = isSectionEdit ? SECTION_EDIT_SYSTEM_PROMPT : undefined;

  const callType: CallType = isSectionEdit ? 'section-edit' : 'full-page';
  let result = await streamBedrockResponse(userMessage, body.framework, res, systemPrompt, callType);
  let currentHtml = result.html;
  let totalInputTokens = result.inputTokens;
  let totalOutputTokens = result.outputTokens;

  if (isSectionEdit) {
    const newSectionHtml = currentHtml;
    const fullPage = replaceSection(body.currentHtml!, body.sectionId!, newSectionHtml);
    currentHtml = fullPage;

    await saveGenerationRecord(
      body.projectId,
      body.prompt.trim(),
      currentHtml,
      true,
      body.sectionId ?? null
    ).catch((err) => console.error('[generate.service] save error:', err));

    sendSSE(res, 'done', { html: currentHtml });

    await recordTokenUsage(userId, totalInputTokens + totalOutputTokens).catch((err) =>
      console.error('[generate.service] Token usage recording failed:', err)
    );
    sendSSE(res, 'usage', { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, total: totalInputTokens + totalOutputTokens });
    return;
  }

  // Full‑page generation: self‑correction loop
  for (let correctionAttempt = 0; correctionAttempt < MAX_CORRECTION_ATTEMPTS; correctionAttempt++) {
    const validation = validateHtml(currentHtml);
    if (validation.isValid) break;
    console.log(`[generate.service] Validation failed (attempt ${correctionAttempt + 1}):`, validation.errors);
    sendSSE(res, 'validation_failed', { errors: validation.errors, attempt: correctionAttempt + 1 });
    const correctionResult = await correctWithLLM(currentHtml, validation.errors, body.prompt, body.framework, res, correctionAttempt + 1);
    currentHtml = correctionResult.html;
    totalInputTokens += correctionResult.inputTokens;
    totalOutputTokens += correctionResult.outputTokens;
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
    false,
    null
  ).catch((err) => console.error('[generate.service] save error:', err));

  sendSSE(res, 'done', { html: currentHtml, validation: finalValidation });

  await recordTokenUsage(userId, totalInputTokens + totalOutputTokens).catch((err) =>
    console.error('[generate.service] Token usage recording failed:', err)
  );
  sendSSE(res, 'usage', { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, total: totalInputTokens + totalOutputTokens });
}