import type { PreviewMethod } from '@/shared/classifier';

const API_URL = import.meta.env.VITE_GENERATE_URL || import.meta.env.VITE_API_URL as string;

export interface GenerateOptions {
  projectId: string;
  accessToken: string;
  sectionId?: string | null;
  currentHtml?: string | null;
  framework?: string;
  previewMethod?: PreviewMethod;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  onChunk: (accumulated: string) => void;
  onDone: (fullHtml: string) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

export async function streamGenerate(
  prompt: string,
  options: GenerateOptions
): Promise<void> {
  const {
    projectId,
    accessToken,
    sectionId,
    currentHtml,
    framework,
    previewMethod,
    conversationHistory,
    onChunk,
    onDone,
    onError,
    signal,
  } = options;

  const body: Record<string, unknown> = {
    prompt,
    projectId,
  };
  if (sectionId)               body.sectionId               = sectionId;
  if (currentHtml)             body.currentHtml             = currentHtml;
  if (framework)               body.framework               = framework;
  if (previewMethod)           body.previewMethod           = previewMethod;
  if (conversationHistory)     body.conversationHistory     = conversationHistory;

  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ??
        `Generation failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error('No response body received from server.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  let reading = true;
  while (reading) {
    const { done, value } = await reader.read();
    if (done) { reading = false; break; }

    buffer += decoder.decode(value, { stream: true });

    const messages = buffer.split('\n\n');
    buffer = messages.pop() ?? '';

    for (const message of messages) {
      const lines = message.trim().split('\n');
      let eventName = 'message';
      let dataLine = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataLine = line.slice(6).trim();
        }
      }

      if (!dataLine) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(dataLine);
      } catch {
        continue;
      }

      if (eventName === 'chunk') {
        const text = (parsed as { text?: string }).text ?? '';
        accumulated += text;
        onChunk(accumulated);
      } else if (eventName === 'done') {
        const html = (parsed as { html?: string }).html ?? accumulated;
        onDone(html);
        return;
      } else if (eventName === 'error') {
        const message =
          (parsed as { message?: string }).message ?? 'Generation failed. Please try again.';
        onError(message);
        return;
      }
    }
  }

  if (accumulated) {
    onDone(accumulated);
  }
}