import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { PreviewPane, ViewportToggle } from '@/features/preview';
import { useWebContainer } from '@/features/preview';
import { useEditHistory } from '../hooks/useEditHistory';
import { useGenerate } from '../hooks/useGenerate';
import { ViewportSize } from '@/features/preview/types/preview.types';
import ConsoleErrorPanel from '@/features/preview/components/ConsoleErrorPanel';
import PromptPanel from './PromptPanel';
import MonacoEditor from './MonacoEditor';
import EditorToolbar from './EditorToolbar';

// Load previously generated HTML from localStorage if available
const savedHtml = localStorage.getItem('generatedHtml') || '';

export default function EditorLayout() {
  const { html, push, undo, redo, canUndo, canRedo } = useEditHistory(savedHtml);
  const { isGenerating, generate } = useGenerate();
  const { status } = useWebContainer();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showCode, setShowCode] = useState(false);

  // Resizable left panel (Member-E)
  const [leftWidth, setLeftWidth] = useState(258); // sidebar default ~258px
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left - 38; // subtract activity bar width
      const maxWidth = rect.width * 0.5;
      setLeftWidth(Math.max(180, Math.min(newWidth, maxWidth)));
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleGenerate = async (prompt: string) => {
    await generate(prompt, (fullHtml) => push(fullHtml));
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e', fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}
    >
      {/* Titlebar */}
      <div style={{ background: '#323233', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: '11px', color: '#ccc', margin: '0 auto', opacity: 0.7 }}>
          PageCraft — editor/my-project
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: status.status === 'ready' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
          border: `1px solid ${status.status === 'ready' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}`,
          padding: '2px 9px', borderRadius: '10px'
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: status.status === 'ready' ? '#22c55e' : '#eab308' }} />
          <span style={{ fontSize: '9px', color: status.status === 'ready' ? '#22c55e' : '#eab308', fontWeight: 500 }}>
            {status.status === 'ready' ? 'Ready' : status.status === 'booting' ? 'Booting...' : status.status === 'installing' ? 'Installing...' : 'Starting...'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#252526', display: 'flex', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
        {[
          { name: 'preview.html', color: '#569cd6' },
          { name: 'prompt.tsx', color: '#ce9178' },
          { name: 'useEditHistory.ts', color: '#4ec9b0' },
        ].map((tab, i) => (
          <div key={tab.name} style={{
            padding: '7px 16px', fontSize: '11px',
            color: i === 0 ? '#fff' : '#969696',
            borderRight: '1px solid #1e1e1e',
            borderTop: i === 0 ? '1px solid #569cd6' : '1px solid transparent',
            background: i === 0 ? '#1e1e1e' : 'transparent',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: tab.color }} />
            {tab.name}
          </div>
        ))}
      </div>

      {/* Body */}
      <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Activity Bar */}
        <div style={{ width: '38px', background: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: '10px', flexShrink: 0 }}>
          {['📁', '🔍', '🔀', '🐛'].map((icon, i) => (
            <div key={i} style={{
              width: '22px', height: '22px', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', cursor: 'pointer',
              opacity: i === 0 ? 1 : 0.4,
              background: i === 0 ? 'rgba(86,156,214,0.2)' : 'transparent'
            }}>{icon}</div>
          ))}
        </div>

        {/* Resizable Sidebar */}
        <div style={{ width: `${leftWidth}px`, background: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px 4px', fontSize: '9px', fontWeight: 700, color: '#bbb', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Explorer</div>
          {[
            { name: 'preview.html', icon: '📄', indent: 0, active: true },
            { name: 'prompt.tsx', icon: '📄', indent: 0, active: false },
            { name: 'hooks/', icon: '📁', indent: 0, active: false },
            { name: 'useEditHistory.ts', icon: '📄', indent: 1, active: false },
            { name: 'useGenerate.ts', icon: '📄', indent: 1, active: false },
          ].map(f => (
            <div key={f.name} style={{
              padding: `3px ${f.indent ? 24 : 10}px`, fontSize: '11px',
              color: f.active ? '#fff' : '#ccc',
              background: f.active ? '#094771' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
            }}>
              <span>{f.icon}</span>{f.name}
            </div>
          ))}
          <div style={{ height: '1px', background: '#333', margin: '8px 0' }} />
          <PromptPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            isReady={status.status === 'ready'}
          />
        </div>

        {/* Resizer Handle (Member-E) */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: '4px',
            cursor: 'col-resize',
            background: isResizing ? '#569cd6' : 'transparent',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          role="separator"
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setLeftWidth(w => Math.max(180, w - 20));
            if (e.key === 'ArrowRight') setLeftWidth(w => Math.min(600, w + 20));
          }}
        />

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Toolbar */}
          <EditorToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            selectedSection={selectedSection}
            viewport={viewport}
            onViewportChange={setViewport}
            showCode={showCode}
            onToggleCode={() => setShowCode(!showCode)}
            html={html}
          />

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Monaco Editor (shown when showCode is true) */}
            {showCode && (
              <div style={{ height: '45%', borderBottom: '2px solid #007acc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#252526', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', color: '#569cd6' }}>📄 preview.html</span>
                  <span style={{ fontSize: '9px', color: '#555', marginLeft: 'auto' }}>HTML Editor</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <MonacoEditor
                    value={html}
                    onChange={(newHtml) => push(newHtml)}
                  />
                </div>
              </div>
            )}

            {/* Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px', gap: '8px', background: '#2d2d2d' }}>

              {/* Empty state */}
              {!html ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#555' }}>
                  <div style={{ fontSize: '48px' }}>✦</div>
                  <p style={{ fontSize: '14px', color: '#666' }}>No website generated yet</p>
                  <p style={{ fontSize: '12px', color: '#444' }}>Go back to home page and generate a website first</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '8px 20px', background: '#0078d4', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
                  >
                    ← Go to Home
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                        <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #404040', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#606060' }}>
                      localhost:3001/index.html
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <ViewportToggle current={viewport} onChange={setViewport} />
                    </div>
                  </div>
                  <PreviewPane
                    html={html}
                    onSectionClick={(id) => setSelectedSection(id)}
                    onConsoleError={(msg) => setConsoleErrors(prev => [...prev, msg])}
                    viewport={viewport}
                    selectedSectionId={selectedSection}
                  />
                  <ConsoleErrorPanel
                    errors={consoleErrors}
                    onClear={() => setConsoleErrors([])}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ background: '#0078d4', padding: '3px 12px', display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
        {['● WebContainer', '📄 preview.html', selectedSection ? `◈ ${selectedSection}` : '◈ no selection'].map(s => (
          <span key={s} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)' }}>{s}</span>
        ))}
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', marginLeft: 'auto' }}>
          🖥 {viewport} · {viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '1280px'}
        </span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </motion.div>
  );
}