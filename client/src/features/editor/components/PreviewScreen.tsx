import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PreviewPane } from '@/features/preview';
import { ViewportSize } from '@/features/preview/types/preview.types';
import { useWebContainer } from '@/features/preview';
import EditorToolbar from './EditorToolbar';
import PromptPanel from './PromptPanel';
import MonacoEditor from './MonacoEditor';

interface StreamingFile {
  name: string;
  content: string;
  language: 'html' | 'css' | 'js' | 'jsx' | 'tsx';
}

interface PreviewScreenProps {
  files: StreamingFile[];
  html: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onGenerate: (prompt: string) => void;
  onCodeChange: (newHtml: string) => void;
  isGenerating: boolean;
  lastPrompt: string;
  onRegenerate: () => void;
  selectedSection: string | null;
  onSectionSelect: (section: string | null) => void;
  projectId?: string;
}

type PanelSide = 'left' | 'right';

export default function PreviewScreen({
  files,
  html,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onGenerate,
  onCodeChange,
  isGenerating,
  lastPrompt,
  onRegenerate,
  selectedSection,
  onSectionSelect,
  projectId,
}: PreviewScreenProps) {
  const { status } = useWebContainer();

  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [showMonaco, setShowMonaco] = useState(false);
  const [panelSide, setPanelSide] = useState<PanelSide>('left');
  const [panelWidth, setPanelWidth] = useState(300);
  const [monacoHeight, setMonacoHeight] = useState(280);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [isResizingMonaco, setIsResizingMonaco] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);

  // Theme sync
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Panel horizontal resize
  const startPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPanel(true);
  }, []);

  useEffect(() => {
    if (!isResizingPanel) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (panelSide === 'left') {
        setPanelWidth(Math.max(220, Math.min(e.clientX - rect.left, rect.width * 0.45)));
      } else {
        setPanelWidth(Math.max(220, Math.min(rect.right - e.clientX, rect.width * 0.45)));
      }
    };
    const onUp = () => setIsResizingPanel(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizingPanel, panelSide]);

  // Monaco vertical resize
  const startMonacoResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingMonaco(true);
  }, []);

  useEffect(() => {
    if (!isResizingMonaco) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const fromBottom = rect.bottom - e.clientY;
      setMonacoHeight(Math.max(150, Math.min(fromBottom, (rect.height - 48) * 0.65)));
    };
    const onUp = () => setIsResizingMonaco(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizingMonaco]);

  // Draggable panel snap left/right
  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setIsDraggingPanel(true);
  }, []);

  useEffect(() => {
    if (!isDraggingPanel) return;
    const onUp = (e: MouseEvent) => {
      setIsDraggingPanel(false);
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPanelSide(e.clientX < rect.left + rect.width / 2 ? 'left' : 'right');
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [isDraggingPanel]);

  const isReady = status.status === 'ready';

  const promptPanel = (
    <motion.div
      layout
      style={{
        width: `${panelWidth}px`,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--brand-surface)',
        borderLeft: panelSide === 'right' ? '1px solid var(--brand-border)' : 'none',
        borderRight: panelSide === 'left' ? '1px solid var(--brand-border)' : 'none',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handlePanelDragStart}
        className="flex items-center justify-center gap-1 py-1.5 cursor-grab active:cursor-grabbing flex-shrink-0"
        style={{ background: 'var(--brand-glass)', borderBottom: '1px solid var(--brand-border)' }}
        title="Drag to switch sides"
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-faint)' }} />
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <PromptPanel
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          isReady={isReady}
          lastPrompt={lastPrompt}
          onRegenerate={onRegenerate}
          selectedSection={selectedSection}
        />
      </div>

      {/* Panel resize handle */}
      <div
        onMouseDown={startPanelResize}
        style={{
          position: 'absolute',
          top: 0, bottom: 0,
          width: '4px',
          cursor: 'col-resize',
          zIndex: 20,
          [panelSide === 'left' ? 'right' : 'left']: 0,
          background: isResizingPanel ? 'var(--brand-primary)' : 'transparent',
          transition: 'background 0.15s',
        }}
      />
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'var(--brand-dark)',
        userSelect: isResizingPanel || isResizingMonaco ? 'none' : undefined,
      }}
    >
      {/* Toolbar */}
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        selectedSection={selectedSection}
        viewport={viewport}
        onViewportChange={setViewport}
        showCode={showMonaco}
        onToggleCode={() => setShowMonaco(v => !v)}
        html={html}
        projectId={projectId}
      />

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {panelSide === 'left' && promptPanel}

        {/* Center */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Preview */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
              padding: '10px',
              gap: '8px',
              background: isDark ? '#2d2d2d' : '#e8e8ed',
              transition: 'background 0.3s ease',
            }}
          >
            {/* Browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  borderRadius: '4px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${isDark ? '#404040' : '#d1d1d6'}`,
                  color: isDark ? '#606060' : '#8e8e93',
                  transition: 'all 0.3s ease',
                }}
              >
                localhost:3001/index.html
              </div>
            </div>

            {/* Preview pane + rendering overlay */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', borderRadius: '8px' }}>
              <PreviewPane
                html={html}
                onSectionClick={(id) => onSectionSelect(id)}
                onConsoleError={(msg) => setConsoleErrors(prev => [...prev, msg])}
                viewport={viewport}
                selectedSectionId={selectedSection}
              />

              {/* Rendering overlay */}
              <AnimatePresence>
                {!isReady && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '12px', zIndex: 20,
                      background: 'rgba(15,15,26,0.85)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                      <Loader2 size={28} style={{ color: 'var(--brand-primary)' }} />
                    </motion.div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {status.status === 'booting' ? 'Booting sandbox...' :
                       status.status === 'installing' ? 'Installing dependencies...' :
                       'Starting server...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected section clear button */}
              <AnimatePresence>
                {selectedSection && (
                  <motion.button
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onClick={() => onSectionSelect(null)}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', borderRadius: '8px',
                      background: 'rgba(59,130,246,0.15)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      color: '#60a5fa', fontSize: '11px', fontWeight: 500,
                      cursor: 'pointer', zIndex: 30,
                    }}
                  >
                    ◈ {selectedSection} · click to clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Monaco resize handle */}
          <AnimatePresence>
            {showMonaco && (
              <>
                <div
                  onMouseDown={startMonacoResize}
                  style={{
                    height: '6px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'row-resize',
                    background: isResizingMonaco ? 'var(--brand-primary)' : '#1e1e1e',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: '32px', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.15)' }} />
                </div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: monacoHeight, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ flexShrink: 0, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 12px', flexShrink: 0,
                      background: isDark ? '#252526' : '#f3f3f3',
                      borderBottom: `1px solid ${isDark ? '#1e1e1e' : '#e0e0e0'}`,
                      fontSize: '11px',
                      color: isDark ? '#569cd6' : '#0066cc',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span>📄</span>
                    <span>index.html</span>
                    <span style={{ marginLeft: 'auto', color: isDark ? '#555' : '#999', fontSize: '10px' }}>HTML Editor</span>
                  </div>
                  <div style={{ height: `${monacoHeight - 28}px` }}>
                    <MonacoEditor value={html} onChange={onCodeChange} isDark={isDark} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {panelSide === 'right' && promptPanel}
      </div>

      {/* Status bar */}
      <div
        style={{
          background: '#007acc', padding: '3px 12px',
          display: 'flex', alignItems: 'center', gap: '16px',
          flexShrink: 0, fontSize: '10px', color: 'rgba(255,255,255,0.85)',
        }}
      >
        <span>● WebContainer</span>
        <span>{selectedSection ? `◈ ${selectedSection}` : '◈ no selection'}</span>
        {consoleErrors.length > 0 && (
          <span style={{ color: '#ffb3b3' }}>⚠ {consoleErrors.length} error{consoleErrors.length > 1 ? 's' : ''}</span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          🖥 {viewport} · {viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '1280px'}
        </span>
      </div>
    </div>
  );
}