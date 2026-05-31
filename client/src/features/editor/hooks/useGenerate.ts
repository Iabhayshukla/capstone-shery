import { useState, useCallback } from 'react';
import { mockGenerateHTML } from '../api/generate.api';

interface UseGenerateReturn {
  isGenerating: boolean;
  generate: (prompt: string, onDone: (html: string) => void) => Promise<void>;
}

export function useGenerate(): UseGenerateReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (
    prompt: string,
    onDone: (html: string) => void
  ) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      await mockGenerateHTML(
        prompt,
        () => {},
        (fullHtml) => {
          onDone(fullHtml);
        }
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, generate };
}