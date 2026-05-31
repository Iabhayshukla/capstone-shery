import { useEffect, useCallback } from 'react';
import { IframeMessage } from '../types/preview.types';

interface UseSectionClickProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onSectionClick?: (sectionId: string) => void;
  onConsoleError?: (message: string) => void;
}

export function useSectionClick({
  iframeRef,
  onSectionClick,
  onConsoleError,
}: UseSectionClickProps) {
  const handleMessage = useCallback(
    (event: MessageEvent<IframeMessage>) => {
      // Only handle messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type } = event.data;

      if (type === 'section_click') {
        onSectionClick?.(event.data.sectionId);
      }

      if (type === 'console_error') {
        console.warn('[Preview Error]', event.data.message);
        onConsoleError?.(event.data.message);
      }
    },
    [iframeRef, onSectionClick, onConsoleError]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);
}