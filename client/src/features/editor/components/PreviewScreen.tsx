import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Monitor, Tablet, Smartphone, Code2, Undo2, Redo2, RotateCcw, ArrowLeft, Download, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, Sparkles, GitBranch, Terminal, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportHtml } from '../api/export.api';
import { PreviewPane } from '@/features/preview';
import { ViewportSize } from '@/features/preview/types/preview.types';
import { useWebContainer } from '@/features/preview';
import PromptPanel, { Message } from './PromptPanel';
import MonacoEditor from './MonacoEditor';

interface StreamingFile {
  name: string;
  content: string;
  language: string;
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
  onReset: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  previewMethod?: 'iframe' | 'webcontainer';
}

type PanelSide = 'left' | 'right';

export default function PreviewScreen({
  files: _files,
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
  projectId: _projectId,
  onReset,
  messages,
  setMessages,
  previewMethod = 'iframe',
}: PreviewScreenProps) {
  const { status } = useWebContainer();

  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [showMonaco, setShowMonaco] = useState(false);
  const [panelSide, setPanelSide] = useState<PanelSide>('left');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(340);
  const [monacoWidth, setMonacoWidth] = useState(520);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [isResizingMonaco, setIsResizingMonaco] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);

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
        setPanelWidth(Math.max(260, Math.min(e.clientX - rect.left, rect.width * 0.45)));
      } else {
        setPanelWidth(Math.max(260, Math.min(rect.right - e.clientX, rect.width * 0.45)));
      }
    };
    const onUp = () => setIsResizingPanel(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizingPanel, panelSide]);

  const startMonacoResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingMonaco(true);
  }, []);

  useEffect(() => {
    if (!isResizingMonaco) return;
    const onMove = (e: MouseEvent) => {
      setMonacoWidth(prev => {
        const newWidth = prev - e.movementX;
        return Math.max(340, Math.min(newWidth, 900));
      });
    };
    const onUp = () => setIsResizingMonaco(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizingMonaco]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) { if (canRedo) { e.preventDefault(); onRedo(); } }
        else { if (canUndo) { e.preventDefault(); onUndo(); } }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) { e.preventDefault(); onRedo(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsPanelOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

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

  const isReady = previewMethod === 'iframe' ? true : status.status === 'ready';
  const vpLabel = viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '1280px';

  const slideVariants = {
    open: { width: panelWidth, opacity: 1, x: 0 },
    closed: {
      width: 0,
      opacity: 0,
      x: panelSide === 'left' ? -panelWidth : panelWidth,
    },
  };

  const PanelToggleIcon = isPanelOpen
    ? (panelSide === 'left' ? PanelLeftClose : PanelRightClose)
    : (panelSide === 'left' ? PanelLeftOpen : PanelRightOpen);

  const promptPanel = (
    <motion.div
      initial={false}
      animate={isPanelOpen ? 'open' : 'closed'}
      variants={slideVariants}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        borderLeft: panelSide === 'right' ? '1px solid var(--border)' : 'none',
        borderRight: panelSide === 'left' ? '1px solid var(--border)' : 'none',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div
        onMouseDown={handlePanelDragStart}
        style={{
          padding: '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          cursor: isDraggingPanel ? 'grabbing' : 'grab',
          flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.15)',
          transition: 'background 0.2s',
        }}
        title="Drag to switch sides"
      >
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
        ))}
        <span style={{ fontSize: 9, marginLeft: 8, color: 'var(--text-muted)', letterSpacing: 1 }}>⇄</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PromptPanel
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          isReady={isReady}
          lastPrompt={lastPrompt}
          onRegenerate={onRegenerate}
          selectedSection={selectedSection}
          messages={messages}
          setMessages={setMessages}
        />
      </div>

      <div
        onMouseDown={startPanelResize}
        className="glow-divider"
        style={{
          position: 'absolute', top: 0, bottom: 0, width: 4,
          cursor: 'col-resize', zIndex: 20,
          [panelSide === 'left' ? 'right' : 'left']: 0,
          background: isResizingPanel ? 'var(--brand-primary)' : 'var(--border)',
          transition: 'background 0.15s',
        }}
      />
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100%',
        background: 'var(--background)',
        userSelect: isResizingPanel || isResizingMonaco ? 'none' : undefined,
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0, height: 52,
      }}>
        <Link
          to="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--text-primary)', textDecoration: 'none',
            marginRight: 24, cursor: 'pointer', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={14} color="white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2.5 }}>
            Capstone<span style={{ color: 'var(--brand-primary)' }}>-Shery</span>
          </span>
        </Link>

        <div style={{ width: 1, height: 24, background: 'var(--border)', marginRight: 16, flexShrink: 0 }} />

        <button
          onClick={() => setIsPanelOpen(v => !v)}
          title={`${isPanelOpen ? 'Hide' : 'Show'} Prompt Panel (Ctrl+B)`}
          className="toolbar-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34,
            background: isPanelOpen ? 'rgba(var(--brand-primary-rgb), 0.1)' : 'transparent',
            border: isPanelOpen ? `1px solid rgba(var(--brand-primary-rgb), 0.25)` : '1px solid transparent',
            color: isPanelOpen ? 'var(--brand-primary)' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8,
            marginRight: 6,
          }}
        >
          <PanelToggleIcon size={15} />
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--border)', marginRight: 12, flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: <Undo2 size={14} />, action: onUndo, disabled: !canUndo, title: 'Undo (Ctrl+Z)' },
            { icon: <Redo2 size={14} />, action: onRedo, disabled: !canRedo, title: 'Redo (Ctrl+Y)' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              disabled={btn.disabled}
              title={btn.title}
              className="toolbar-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34,
                background: 'transparent', border: '1px solid transparent',
                color: btn.disabled ? 'rgba(255,255,255,0.15)' : 'var(--text-muted)',
                cursor: btn.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', borderRadius: 8,
              }}
              onMouseEnter={e => { if (!btn.disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 12px', flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: 10 }}>
          {([
            { v: 'desktop' as ViewportSize, icon: <Monitor size={14} /> },
            { v: 'tablet' as ViewportSize, icon: <Tablet size={14} /> },
            { v: 'mobile' as ViewportSize, icon: <Smartphone size={14} /> },
          ]).map(({ v, icon }) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className="toolbar-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                background: viewport === v ? 'rgba(var(--brand-primary-rgb), 0.15)' : 'transparent',
                border: 'none',
                color: viewport === v ? 'var(--brand-primary)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s', borderRadius: 8,
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        <div style={{
          marginLeft: 12,
          fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
          color: previewMethod === 'webcontainer' ? 'var(--brand-primary)' : 'var(--text-muted)',
          border: `1px solid ${previewMethod === 'webcontainer' ? 'rgba(var(--brand-primary-rgb), 0.3)' : 'var(--border)'}`,
          padding: '4px 12px', borderRadius: 20, background: previewMethod === 'webcontainer' ? 'rgba(var(--brand-primary-rgb), 0.05)' : 'transparent',
        }}>
          {previewMethod === 'webcontainer' ? '⚡ WebContainer' : '◈ iframe'}
        </div>

        <div style={{ flex: 1 }} />

        {lastPrompt && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="toolbar-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
              color: 'var(--text-muted)', background: 'transparent',
              border: '1px solid var(--border)',
              padding: '6px 16px', cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginRight: 8, borderRadius: 20,
              height: 34,
            }}
          >
            <RotateCcw size={12} />
            Regenerate
          </button>
        )}

        <button
          onClick={onReset}
          className="toolbar-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '6px 16px', cursor: 'pointer',
            transition: 'all 0.2s', borderRadius: 20, height: 34, marginRight: 8,
          }}
          title="Reset Code to Original"
        >
          <RotateCcw size={12} />
          Reset
        </button>

        <button
          onClick={() => exportHtml(html)}
          className="toolbar-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: '#22c55e', background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            padding: '6px 16px', cursor: 'pointer',
            transition: 'all 0.2s', borderRadius: 20, height: 34, marginRight: 8,
          }}
          title="Export HTML Website"
        >
          <Download size={12} />
          Export
        </button>

        <button
          onClick={() => setShowMonaco(v => !v)}
          className="toolbar-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: showMonaco ? 'var(--brand-primary)' : 'var(--text-muted)',
            background: showMonaco ? 'rgba(var(--brand-primary-rgb), 0.1)' : 'transparent',
            border: `1px solid ${showMonaco ? 'rgba(var(--brand-primary-rgb), 0.3)' : 'var(--border)'}`,
            padding: '6px 16px', cursor: 'pointer',
            transition: 'all 0.2s', borderRadius: 20, height: 34,
          }}
        >
          <Code2 size={12} />
          {showMonaco ? 'Hide Code' : 'Edit Code'}
        </button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {panelSide === 'left' && promptPanel}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minWidth: 0 }}>
          {/* Browser chrome wrapper - NO CURVES */}
          <div className="preview-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 4 }}>
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', minHeight: 0,
              padding: 12, gap: 12,
              background: 'var(--background)',
            }}>
              {/* Browser address bar - square corners */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                flexShrink: 0, padding: '8px 16px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                    <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: '0 0 2px rgba(0,0,0,0.2)' }} />
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
                  <ArrowLeft size={14} style={{ cursor: 'not-allowed', opacity: 0.4 }} />
                  <ArrowLeft size={14} style={{ cursor: 'not-allowed', opacity: 0.4, transform: 'rotate(180deg)' }} />
                  <motion.div
                    animate={!isReady ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    style={{ display: 'inline-flex', cursor: isReady ? 'pointer' : 'not-allowed' }}
                    onClick={() => { if (isReady) setRefreshTrigger(prev => prev + 1); }}
                  >
                    <RotateCcw size={13} style={{ opacity: isReady ? 0.7 : 0.4 }} />
                  </motion.div>
                </div>

                <div style={{
                  flex: 1, padding: '6px 14px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  fontSize: 11, color: 'var(--text-muted)',
                  fontFamily: 'monospace', letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {previewMethod === 'webcontainer' && (
                    <Loader2 size={11} style={{ color: 'var(--brand-primary)', animation: isReady ? 'none' : 'spin 1s linear infinite' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)' }}>
                    {previewMethod === 'webcontainer' ? 'localhost:3001' : 'live preview'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/index.html</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>· {vpLabel}</span>
                </div>

                {selectedSection && (
                  <div style={{
                    fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                    color: 'var(--brand-primary)', border: `1px solid rgba(var(--brand-primary-rgb), 0.25)`,
                    padding: '4px 14px', background: 'rgba(var(--brand-primary-rgb), 0.05)',
                  }}>
                    ◈ {selectedSection}
                  </div>
                )}
              </div>

              {/* Preview pane - NO BORDER RADIUS, sharp edges */}
              <div style={{ position: 'relative', flex: 1, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <PreviewPane
                  html={html}
                  onSectionClick={(id) => onSectionSelect(id)}
                  onConsoleError={(msg) => setConsoleErrors(prev => [...prev, msg])}
                  viewport={viewport}
                  selectedSectionId={selectedSection}
                  hideHeader={true}
                  refreshTrigger={refreshTrigger}
                  previewMethod={previewMethod}
                />

                <AnimatePresence>
                  {!isReady && previewMethod === 'webcontainer' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 16, zIndex: 20,
                        background: 'rgba(7,7,7,0.9)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                        <Loader2 size={28} style={{ color: 'var(--brand-primary)' }} />
                      </motion.div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        {status.status === 'booting' ? 'Booting sandbox...' :
                         status.status === 'installing' ? 'Installing dependencies...' : 'Starting server...'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedSection && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => onSectionSelect(null)}
                      className="hover-glow"
                      style={{
                        position: 'absolute', top: 14, right: 14,
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px',
                        background: 'rgba(var(--brand-primary-rgb), 0.12)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid rgba(var(--brand-primary-rgb), 0.3)`,
                        color: 'var(--brand-primary)', fontSize: 10,
                        letterSpacing: 1.5, textTransform: 'uppercase',
                        fontWeight: 500, cursor: 'pointer', zIndex: 30,
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Eye size={12} />
                      {selectedSection} · clear
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Floating panel toggle when closed */}
                <AnimatePresence>
                  {!isPanelOpen && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => setIsPanelOpen(true)}
                      title="Show Prompt Panel (Ctrl+B)"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        [panelSide === 'left' ? 'left' : 'right']: 16,
                        transform: 'translateY(-50%)',
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px',
                        background: 'rgba(var(--brand-primary-rgb), 0.12)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid rgba(var(--brand-primary-rgb), 0.3)`,
                        color: 'var(--brand-primary)',
                        cursor: 'pointer', zIndex: 30,
                        flexDirection: 'row',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      <PanelToggleIcon size={14} />
                      <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>Panel</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Monaco resize handle */}
          <AnimatePresence>
            {showMonaco && (
              <div
                onMouseDown={startMonacoResize}
                className="glow-divider"
                style={{
                  width: 4, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'col-resize',
                  background: isResizingMonaco ? 'var(--brand-primary)' : 'var(--border)',
                  transition: 'background 0.15s',
                  margin: '8px 0',
                }}
              />
            )}
          </AnimatePresence>

          {/* Monaco Editor */}
          <AnimatePresence>
            {showMonaco && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: monacoWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  flexShrink: 0, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--surface)',
                  borderLeft: '1px solid var(--border)',
                  margin: '4px 4px 4px 0',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 18px',
                  background: 'var(--surface-elevated)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                  color: 'var(--text-muted)', height: 44, flexShrink: 0,
                }}>
                  <Code2 size={13} style={{ color: 'var(--brand-primary)' }} />
                  index.html
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10 }}>HTML Editor</span>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <MonacoEditor value={html} onChange={onCodeChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {panelSide === 'right' && promptPanel}
      </div>

      {/* Status bar */}
      <div style={{
        background: 'var(--surface)', padding: '8px 24px',
        display: 'flex', alignItems: 'center', gap: 24,
        flexShrink: 0, fontSize: 10,
        letterSpacing: 1.5, textTransform: 'uppercase',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isReady ? '#22c55e' : 'var(--brand-primary)',
            boxShadow: `0 0 8px ${isReady ? '#22c55e' : 'var(--brand-primary)'}`,
            display: 'inline-block',
          }} />
          <span style={{ color: 'var(--text-primary)' }}>
            {previewMethod === 'webcontainer' ? `WebContainer: ${status.status}` : 'iframe: ready'}
          </span>
        </div>
        <span style={{ color: 'var(--border)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={10} />
          <span style={{ color: selectedSection ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
            {selectedSection ? `Section: ${selectedSection}` : 'No Selection'}
          </span>
        </div>
        <span style={{ color: 'var(--border)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: consoleErrors.length > 0 ? '#ff5f57' : 'var(--text-muted)' }}>
            Errors: {consoleErrors.length}
          </span>
        </div>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span>Size: {(html.length / 1024).toFixed(1)} KB</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: isPanelOpen ? '#22c55e' : 'var(--text-muted)' }}>
          Panel: {isPanelOpen ? 'Open' : 'Hidden'}
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span>Mode: {previewMethod}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {viewport} · {vpLabel}
        </span>
      </div>

      {/* Floating Action Button (FAB) for Generate */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.08, boxShadow: `0 0 28px rgba(var(--brand-primary-rgb), 0.6)` }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsPanelOpen(true);
              setTimeout(() => {
                const input = document.querySelector('.prompt-input') as HTMLTextAreaElement;
                if (input) input.focus();
              }, 200);
            }}
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 0 20px rgba(var(--brand-primary-rgb), 0.5)`,
              zIndex: 100,
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={26} color="#080808" />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        
        /* Removed gradient-border animation and border-radius from preview container */
        .preview-container {
          position: relative;
          overflow: hidden;
        }
        
        .glow-divider {
          transition: background 0.15s, box-shadow 0.15s;
        }
        
        .glow-divider:hover {
          background: var(--brand-primary) !important;
          box-shadow: 0 0 12px rgba(var(--brand-primary-rgb), 0.8);
        }
        
        .toolbar-btn {
          transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .toolbar-btn:hover:not(:disabled) {
          background: rgba(var(--brand-primary-rgb), 0.08);
          border-color: rgba(var(--brand-primary-rgb), 0.2);
          color: var(--brand-primary);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 12px rgba(var(--brand-primary-rgb), 0.5);
          background: rgba(var(--brand-primary-rgb), 0.2);
        }
      `}</style>
    </div>
  );
}