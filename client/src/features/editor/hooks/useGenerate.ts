import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth';
import { streamGenerate } from '../api/generate.api';
import { classifyPrompt, ClassifierResult } from '@/shared/classifier';

interface UseGenerateOptions {
  projectId: string | undefined;
  selectedSection?: string | null;
  currentHtml?: string | null;
}

interface UseGenerateReturn {
  isGenerating: boolean;
  streamingHtml: string;
  error: string | null;
  classification: ClassifierResult | null;
  generate: (prompt: string, history?: { role: 'user' | 'assistant'; content: string }[]) => Promise<void>;
  cancel: () => void;
}

export function useGenerate(options: UseGenerateOptions): UseGenerateReturn {
  const { accessToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingHtml, setStreamingHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassifierResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string, history?: { role: 'user' | 'assistant'; content: string }[]) => {
      if (!accessToken) {
        setError('You must be logged in to generate.');
        return;
      }
      if (!options.projectId) {
        setError('No project selected.');
        return;
      }
      if (!prompt.trim()) return;

      const result = classifyPrompt(prompt);
      setClassification(result);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsGenerating(true);
      setStreamingHtml('');
      setError(null);

      try {
        await streamGenerate(prompt, {
          projectId: options.projectId,
          accessToken,
          sectionId: options.selectedSection ?? undefined,
          currentHtml: options.currentHtml ?? undefined,
          framework: result.framework,
          previewMethod: result.previewMethod,
          conversationHistory: history,
          onChunk: (accumulated) => setStreamingHtml(accumulated),
          onDone: (fullHtml) => setStreamingHtml(fullHtml),
          onError: (message) => setError(message),
          signal: abortRef.current.signal,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    [accessToken, options.projectId, options.selectedSection, options.currentHtml]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  return { isGenerating, streamingHtml, error, classification, generate, cancel };
}