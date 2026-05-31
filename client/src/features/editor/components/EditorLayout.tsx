import { useState } from 'react';
import { PreviewPane, ViewportToggle } from '@/features/preview';
import { useWebContainer } from '@/features/preview';
import { useEditHistory } from '../hooks/useEditHistory';
import { useGenerate } from '../hooks/useGenerate';
import { ViewportSize } from '@/features/preview/types/preview.types';
import ConsoleErrorPanel from '@/features/preview/components/ConsoleErrorPanel';
import PromptPanel from './PromptPanel';

const DUMMY_HTML = `
<section data-section-id="hero" style="background:linear-gradient(135deg,#1e1b4b,#2d2a7a,#312e81);padding:60px 40px;text-align:center;">
  <h1 style="font-size:2.5rem;color:#fff;font-weight:800;letter-spacing:-1px;margin-bottom:12px;">Welcome to Your Website</h1>
  <p style="font-size:1.1rem;color:#a5b4fc;margin-bottom:24px;">AI-generated · click any section to select and edit it</p>
  <a href="#" style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:10px 28px;font-size:0.95rem;color:#fff;font-weight:600;text-decoration:none;">Get Started →</a>
</section>

<section data-section-id="features" style="padding:48px 32px;background:#f8f7ff;">
  <h2 style="text-align:center;font-size:1.8rem;color:#1e1b4b;font-weight:700;margin-bottom:32px;">Why Choose Us</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto;">
    <div style="background:#fff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">⚡</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Fast</h3>
      <p style="color:#6366f1;font-size:0.85rem;">Live preview as you type</p>
    </div>
    <div style="background:#fff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">🧠</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Smart</h3>
      <p style="color:#6366f1;font-size:0.85rem;">AI powered generation</p>
    </div>
    <div style="background:#fff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">✏️</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Editable</h3>
      <p style="color:#6366f1;font-size:0.85rem;">Click sections to edit</p>
    </div>
  </div>
</section>

<section data-section-id="footer" style="background:#0f172a;padding:32px;text-align:center;">
  <p style="color:#475569;font-size:0.85rem;">Built with ❤️ — Capstone Project 2026</p>
</section>
`;

export default function EditorLayout() {
  const { html, push, undo, redo, canUndo, canRedo } = useEditHistory(DUMMY_HTML);
  const { isGenerating, generate } = useGenerate();
  const { status } = useWebContainer();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const handleGenerate = async (prompt: string) => {
    await generate(prompt, (fullHtml) => push(fullHtml));
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#1e1e1e', fontFamily:'ui-sans-serif,system-ui,sans-serif' }}>

      {/* ── Titlebar ── */}
      <div style={{ background:'#323233', padding:'7px 14px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'6px' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width:'11px', height:'11px', borderRadius:'50%', background:c }} />
          ))}
        </div>
        <span style={{ fontSize:'11px', color:'#ccc', margin:'0 auto', opacity:0.7, letterSpacing:'0.2px' }}>
          PageCraft — editor/my-project
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', padding:'2px 9px', borderRadius:'10px' }}>
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: status.status === 'ready' ? '#22c55e' : '#eab308', animation:'pulse 1.5s infinite' }} />
          <span style={{ fontSize:'9px', color: status.status === 'ready' ? '#22c55e' : '#eab308', fontWeight:500 }}>
            {status.status === 'ready' ? 'Ready' : status.status === 'booting' ? 'Booting...' : status.status === 'installing' ? 'Installing...' : 'Starting...'}
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background:'#252526', display:'flex', borderBottom:'1px solid #1e1e1e', flexShrink:0 }}>
        {[
          { name:'preview.html', color:'#569cd6' },
          { name:'prompt.tsx', color:'#ce9178' },
          { name:'useEditHistory.ts', color:'#4ec9b0' },
        ].map((tab, i) => (
          <div key={tab.name} style={{
            padding:'7px 16px', fontSize:'11px',
            color: i === 0 ? '#fff' : '#969696',
            borderRight:'1px solid #1e1e1e',
            borderTop: i === 0 ? '1px solid #569cd6' : '1px solid transparent',
            background: i === 0 ? '#1e1e1e' : 'transparent',
            display:'flex', alignItems:'center', gap:'6px', cursor:'pointer',
          }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:tab.color }} />
            {tab.name}
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Activity Bar */}
        <div style={{ width:'38px', background:'#333', display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0', gap:'10px', flexShrink:0 }}>
          {['📁','🔍','🔀','🐛'].map((icon, i) => (
            <div key={i} style={{
              width:'22px', height:'22px', borderRadius:'4px',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'12px', cursor:'pointer',
              opacity: i === 0 ? 1 : 0.4,
              background: i === 0 ? 'rgba(86,156,214,0.2)' : 'transparent',
            }}>{icon}</div>
          ))}
        </div>

        {/* Sidebar — File Explorer + Prompt */}
        <div style={{ width:'220px', background:'#252526', borderRight:'1px solid #1e1e1e', display:'flex', flexDirection:'column', flexShrink:0 }}>
          {/* File Explorer */}
          <div style={{ padding:'8px 10px 4px', fontSize:'9px', fontWeight:700, color:'#bbb', letterSpacing:'0.8px', textTransform:'uppercase' }}>Explorer</div>
          {[
            { name:'preview.html', icon:'📄', indent:0, active:true },
            { name:'prompt.tsx', icon:'📄', indent:0, active:false },
            { name:'hooks/', icon:'📁', indent:0, active:false },
            { name:'useEditHistory.ts', icon:'📄', indent:1, active:false },
            { name:'useGenerate.ts', icon:'📄', indent:1, active:false },
          ].map((f) => (
            <div key={f.name} style={{
              padding:`3px ${f.indent ? 24 : 10}px`,
              fontSize:'11px', color: f.active ? '#fff' : '#ccc',
              background: f.active ? '#094771' : 'transparent',
              display:'flex', alignItems:'center', gap:'5px', cursor:'pointer',
            }}>
              <span style={{ fontSize:'11px' }}>{f.icon}</span>
              {f.name}
            </div>
          ))}

          <div style={{ height:'1px', background:'#333', margin:'8px 0' }} />

          {/* Prompt Panel */}
          <PromptPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            isReady={status.status === 'ready'}
          />
        </div>

        {/* Main — Toolbar + Preview */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Editor Toolbar */}
          <div style={{ background:'#1e1e1e', borderBottom:'1px solid #333', padding:'5px 12px', display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
            <button onClick={undo} disabled={!canUndo} style={{ padding:'3px 9px', background:'transparent', border:'1px solid #3e3e3e', borderRadius:'3px', fontSize:'10px', color: canUndo ? '#ccc' : '#555', cursor: canUndo ? 'pointer' : 'not-allowed' }}>↩ Undo</button>
            <button onClick={redo} disabled={!canRedo} style={{ padding:'3px 9px', background:'transparent', border:'1px solid #3e3e3e', borderRadius:'3px', fontSize:'10px', color: canRedo ? '#ccc' : '#555', cursor: canRedo ? 'pointer' : 'not-allowed' }}>↪ Redo</button>

            <div style={{ width:'1px', height:'14px', background:'#333' }} />

            {selectedSection && (
              <span style={{ fontSize:'10px', color:'#569cd6', fontWeight:600 }}>
                ◈ {selectedSection} selected
              </span>
            )}

            {/* Viewport Toggle */}
            <div style={{ marginLeft:'auto' }}>
              <ViewportToggle current={viewport} onChange={setViewport} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ flex:1, overflow:'hidden', padding:'12px', background:'#2d2d2d', display:'flex', flexDirection:'column', gap:'10px' }}>
            <PreviewPane
              html={html}
              onSectionClick={(id) => setSelectedSection(id)}
              onConsoleError={(msg) => setConsoleErrors(prev => [...prev, msg])}
              viewport={viewport}
              selectedSectionId={selectedSection}
            />
            <ConsoleErrorPanel errors={consoleErrors} onClear={() => setConsoleErrors([])} />
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{ background:'#0078d4', padding:'3px 12px', display:'flex', gap:'16px', alignItems:'center', flexShrink:0 }}>
        {[
          '● WebContainer',
          '📄 preview.html',
          selectedSection ? `◈ ${selectedSection}` : '◈ no selection',
        ].map(s => (
          <span key={s} style={{ fontSize:'10px', color:'rgba(255,255,255,0.85)' }}>{s}</span>
        ))}
        <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.85)', marginLeft:'auto' }}>
          🖥 {viewport} · {viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '1280px'}
        </span>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}