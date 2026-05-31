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

export default function PreviewPane({ html, onSectionClick, onConsoleError, viewport = 'desktop', selectedSectionId = null }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { status, previewUrl, updateHtml } = useWebContainer();

  useEffect(() => {
    if (!html || status.status !== 'ready') return;
    const run = async () => {
      await updateHtml(html);
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
      }, 100);
    };
    run();
  }, [html, status.status, updateHtml]);

  useSectionClick({ iframeRef, onSectionClick, onConsoleError });

  const iframeWidth = VIEWPORT_WIDTHS[viewport];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', borderRadius:'8px', overflow:'hidden', border:'1px solid #404040' }}>

      {/* Status bar */}
      {status.status !== 'ready' && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'6px', background:'rgba(234,179,8,0.1)', borderBottom:'1px solid rgba(234,179,8,0.2)', fontSize:'11px', color:'#eab308' }}>
          <span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⚙</span>
          {status.status === 'booting' && 'Booting WebContainer...'}
          {status.status === 'installing' && 'Installing dependencies...'}
          {status.status === 'idle' && 'Initializing...'}
          {status.status === 'error' && `Error: ${status.error}`}
        </div>
      )}

      {/* Browser chrome */}
      <div style={{ background:'#2d2d2d', padding:'6px 10px', display:'flex', alignItems:'center', gap:'6px', borderBottom:'1px solid #404040', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'4px' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width:'9px', height:'9px', borderRadius:'50%', background:c }} />
          ))}
        </div>
        <div style={{ flex:1, background:'#1a1a1a', border:'1px solid #404040', borderRadius:'4px', padding:'3px 10px', fontSize:'10px', color:'#606060', marginLeft:'6px' }}>
          localhost:3001/index.html
        </div>
      </div>

      {/* Preview iframe */}
      <div style={{ flex:1, display:'flex', justifyContent:'center', overflow:'auto', background:'#2d2d2d', padding:'12px' }}>
        <div style={{ background:'#fff', boxShadow:'0 4px 24px rgba(0,0,0,0.4)', transition:'all 0.3s ease', height:'100%', width: iframeWidth }}>
          {previewUrl ? (
            <>
              <iframe
                ref={iframeRef}
                src={previewUrl}
                style={{ width:'100%', height:'100%', border:'none' }}
                title="Live Preview"
              />
              <SectionHighlight selectedSectionId={selectedSectionId} iframeRef={iframeRef} />
            </>
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#606060', fontSize:'12px' }}>
              {status.status === 'error' ? status.error : 'Starting preview...'}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}