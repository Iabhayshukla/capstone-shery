import { useEffect } from 'react';

interface SectionHighlightProps {
  selectedSectionId: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export default function SectionHighlight({
  selectedSectionId,
  iframeRef,
}: SectionHighlightProps) {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // contentDocument nahi — postMessage se iframe ko batao
    iframe.contentWindow?.postMessage(
      { type: 'highlight_section', sectionId: selectedSectionId },
      '*'
    );
  }, [selectedSectionId, iframeRef]);

  return null;
}