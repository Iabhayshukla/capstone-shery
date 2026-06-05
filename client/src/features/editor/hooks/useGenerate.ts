import { useState, useCallback } from 'react';
import { mockGenerateHTML } from '../api/generate.api';

interface UseGenerateReturn {
  isGenerating: boolean;
  generate: (
    prompt: string,
    onDone: (html: string) => void,
    options?: {
      currentHtml?: string;
      selectedSection?: string | null;
    }
  ) => Promise<void>;
}

export function useGenerate(): UseGenerateReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (
    prompt: string,
    onDone: (html: string) => void,
    options?: {
      currentHtml?: string;
      selectedSection?: string | null;
    }
  ) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      await mockGenerateHTML(prompt, () => {}, (fullHtml) => onDone(fullHtml), options);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, generate };
}