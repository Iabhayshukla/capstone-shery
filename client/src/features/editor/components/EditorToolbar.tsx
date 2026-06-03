import { exportHtml } from '../api/export.api';
import ViewportToggle from '@/features/preview/components/ViewportToggle';
import { ViewportSize } from '@/features/preview/types/preview.types';

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedSection: string | null;
  viewport: ViewportSize;
  onViewportChange: (v: ViewportSize) => void;
  showCode: boolean;
  onToggleCode: () => void;
  html: string;
}

export default function EditorToolbar({
  canUndo, canRedo, onUndo, onRedo,
  selectedSection, viewport, onViewportChange,
  showCode, onToggleCode, html,
}: EditorToolbarProps) {
  return (
    <div style={{ background:'#1e1e1e', borderBottom:'1px solid #333', padding:'5px 12px', display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>

      {/* Undo/Redo */}
      <button onClick={onUndo} disabled={!canUndo} style={{ padding:'3px 9px', background:'transparent', border:'1px solid #3e3e3e', borderRadius:'3px', fontSize:'10px', color: canUndo?'#ccc':'#555', cursor: canUndo?'pointer':'not-allowed' }}>
        ↩ Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} style={{ padding:'3px 9px', background:'transparent', border:'1px solid #3e3e3e', borderRadius:'3px', fontSize:'10px', color: canRedo?'#ccc':'#555', cursor: canRedo?'pointer':'not-allowed' }}>
        ↪ Redo
      </button>

      <div style={{ width:'1px', height:'14px', background:'#333' }} />

      {/* Export */}
      <button
        onClick={() => exportHtml(html)}
        style={{ padding:'3px 9px', background:'transparent', border:'1px solid #3e3e3e', borderRadius:'3px', fontSize:'10px', color:'#4ec9b0', cursor:'pointer' }}
      >
        ⬇ Export HTML
      </button>

      <div style={{ width:'1px', height:'14px', background:'#333' }} />

      {/* Code Toggle */}
      <button
        onClick={onToggleCode}
        style={{ padding:'3px 10px', background: showCode ? '#0078d4' : 'transparent', border:'1px solid ' + (showCode ? '#0078d4' : '#3e3e3e'), borderRadius:'3px', fontSize:'10px', color: showCode ? '#fff' : '#969696', cursor:'pointer' }}
      >
        {showCode ? '👁 Preview' : '</> Code'}
      </button>

      {/* Selected Section */}
      {selectedSection && (
        <>
          <div style={{ width:'1px', height:'14px', background:'#333' }} />
          <span style={{ fontSize:'10px', color:'#569cd6', fontWeight:600 }}>◈ {selectedSection}</span>
        </>
      )}

      {/* Viewport Toggle */}
      <div style={{ marginLeft:'auto' }}>
        <ViewportToggle current={viewport} onChange={onViewportChange} />
      </div>

    </div>
  );
}