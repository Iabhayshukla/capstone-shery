import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth';
import { streamGenerate } from '../api/generate.api';

interface UseGenerateOptions {
  projectId: string | undefined;
  selectedSection?: string | null;
  currentHtml?: string | null;
}

interface UseGenerateReturn {
  isGenerating: boolean;
  streamingHtml: string;
  error: string | null;
  generate: (prompt: string) => Promise<void>;
  cancel: () => void;
}

export function useGenerate(options: UseGenerateOptions): UseGenerateReturn {
  const { accessToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingHtml, setStreamingHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (!accessToken) {
        setError('You must be logged in to generate.');
        return;
      }
      if (!options.projectId) {
        setError('No project selected.');
        return;
      }
      if (!prompt.trim()) return;

      // Cancel any in-flight request
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
          onChunk: (accumulated) => setStreamingHtml(accumulated),
          onDone: (fullHtml) => setStreamingHtml(fullHtml),
          onError: (message) => setError(message),
          signal: abortRef.current.signal,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          // User cancelled — not an error
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Generation failed. Please try again.'
        );
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

  return { isGenerating, streamingHtml, error, generate, cancel };
}