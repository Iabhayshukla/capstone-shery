import { useRef, useEffect } from 'react';
import { useWebContainer } from '../hooks/useWebContainer';
import { useSectionClick } from '../hooks/useSectionClick';
import { ViewportSize } from '../types/preview.types';
import SectionHighlight from './SectionHighlight';

interface PreviewPaneProps {
  html: string;
  onSectionClick?: (sectionId: string) => void;
  onConsoleError?: (message: string) => void;
  viewport?: ViewportSize;
  selectedSectionId?: string | null;
}

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

export default function PreviewPane({
  html,
  onSectionClick,
  onConsoleError,
  viewport = 'desktop',
  selectedSectionId = null,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { status, previewUrl, updateHtml } = useWebContainer();

  useEffect(() => {
    if (!html || status.status !== 'ready') return;

    const run = async () => {
      await updateHtml(html);
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }, 100);
    };

    run();
  }, [html, status.status, updateHtml]);

  useSectionClick({ iframeRef, onSectionClick, onConsoleError });

  const iframeWidth = VIEWPORT_WIDTHS[viewport];

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">

      {/* Status Bar */}
      {status.status !== 'ready' && (
        <div className="flex items-center justify-center gap-2 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-700">
          <span className="animate-spin inline-block">⚙️</span>
          {status.status === 'booting' && 'Booting WebContainer...'}
          {status.status === 'installing' && 'Installing dependencies...'}
          {status.status === 'idle' && 'Initializing...'}
          {status.status === 'error' && `Error: ${status.error}`}
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 flex justify-center overflow-auto bg-gray-200 p-4">
        <div
          className="bg-white shadow-lg transition-all duration-300 h-full"
          style={{ width: iframeWidth }}
        >
          {previewUrl ? (
            <>
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
              />
              <SectionHighlight
                selectedSectionId={selectedSectionId}
                iframeRef={iframeRef}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {status.status === 'error' ? status.error : 'Starting preview...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}