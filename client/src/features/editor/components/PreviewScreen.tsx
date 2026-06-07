import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Monitor, Tablet, Smartphone, Code2, Undo2, Redo2, RotateCcw, ArrowLeft, Download, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportHtml } from '../api/export.api';
import { PreviewPane } from '@/features/preview';
import { ViewportSize } from '@/features/preview/types/preview.types';
import { useWebContainer } from '@/features/preview';
import EditorToolbar from './EditorToolbar';
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
}: PreviewScreenProps) {
  const { status } = useWebContainer();

  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [showMonaco, setShowMonaco] = useState(false);
  const [panelSide, setPanelSide] = useState<PanelSide>('left');
  const [isPanelOpen, setIsPanelOpen] = useState(true); // ← NEW: slide toggle
  const [panelWidth, setPanelWidth] = useState(300);
  const [monacoWidth, setMonacoWidth] = useState(450);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [isResizingMonaco, setIsResizingMonaco] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);

  const [isDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Panel resize
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

  // Monaco resize (horizontal split)
  const startMonacoResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingMonaco(true);
  }, []);

  useEffect(() => {
    if (!isResizingMonaco) return;
    const onMove = (e: MouseEvent) => {
      setMonacoWidth(prev => {
        const deltaX = e.movementX;
        const newWidth = prev - deltaX;
        return Math.max(280, Math.min(newWidth, 800));
      });
    };
    const onUp = () => setIsResizingMonaco(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizingMonaco]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) { e.preventDefault(); onRedo(); }
        } else {
          if (canUndo) { e.preventDefault(); onUndo(); }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) { e.preventDefault(); onRedo(); }
      }
      // Toggle panel with Ctrl+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsPanelOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  // Panel drag to snap sides
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
  const vpLabel = viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '1280px';

  // Slide direction based on which side the panel is on
  const slideVariants = {
    open: { width: panelWidth, opacity: 1, x: 0 },
    closed: {
      width: 0,
      opacity: 0,
      x: panelSide === 'left' ? -panelWidth : panelWidth,
    },
  };

  // Pick correct panel toggle icon
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
        background: 'var(--brand-surface)',
        borderLeft: panelSide === 'right' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        borderRight: panelSide === 'left' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden', // critical — hides content while sliding
        minWidth: 0,
      }}
    >
      {/* Drag grip */}
      <div
        onMouseDown={handlePanelDragStart}
        style={{
          padding: '8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: isDraggingPanel ? 'grabbing' : 'grab',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)',
        }}
        title="Drag to switch sides"
      >
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        ))}
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

      {/* Panel resize handle */}
      <div
        onMouseDown={startPanelResize}
        className="glow-divider"
        style={{
          position: 'absolute', top: 0, bottom: 0, width: 5,
          cursor: 'col-resize', zIndex: 20,
          [panelSide === 'left' ? 'right' : 'left']: 0,
          background: isResizingPanel ? '#D4FF57' : 'rgba(255, 255, 255, 0.05)',
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
        background: 'var(--brand-dark)',
        userSelect: isResizingPanel || isResizingMonaco ? 'none' : undefined,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* ── TOP TOOLBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'var(--brand-surface)',
        flexShrink: 0, height: 44,
      }}>
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#f0ede6', textDecoration: 'none',
            marginRight: 20, cursor: 'pointer', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
        >
          <ArrowLeft size={14} style={{ color: '#D4FF57' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3 }}>
            Capstone<span style={{ color: '#D4FF57' }}>-Shery</span>
          </span>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', marginRight: 16, flexShrink: 0 }} />

        {/* ── PANEL TOGGLE BUTTON ── */}
        <button
          onClick={() => setIsPanelOpen(v => !v)}
          title={`${isPanelOpen ? 'Hide' : 'Show'} Prompt Panel (Ctrl+B)`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30,
            background: isPanelOpen ? 'rgba(212,255,87,0.08)' : 'transparent',
            border: isPanelOpen ? '1px solid rgba(212,255,87,0.25)' : '1px solid transparent',
            color: isPanelOpen ? '#D4FF57' : 'rgba(240,237,230,0.65)',
            cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0,
            marginRight: 4,
          }}
        >
          <PanelToggleIcon size={13} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', marginRight: 12, flexShrink: 0 }} />

        {/* Undo/Redo */}
        {[
          { icon: <Undo2 size={13} />, action: onUndo, disabled: !canUndo, title: 'Undo (Ctrl+Z)' },
          { icon: <Redo2 size={13} />, action: onRedo, disabled: !canRedo, title: 'Redo (Ctrl+Y)' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            disabled={btn.disabled}
            title={btn.title}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30,
              background: 'transparent', border: 'none',
              color: btn.disabled ? 'rgba(255,255,255,0.15)' : 'rgba(240,237,230,0.75)',
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
              transition: 'color 0.15s', borderRadius: 0,
            }}
            onMouseEnter={e => { if (!btn.disabled) (e.currentTarget as HTMLButtonElement).style.color = '#f0ede6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = btn.disabled ? 'rgba(255,255,255,0.15)' : 'rgba(240,237,230,0.75)'; }}
          >
            {btn.icon}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 12px', flexShrink: 0 }} />

        {/* Viewport switcher */}
        <div style={{ display: 'flex', gap: 2 }}>
          {([
            { v: 'desktop' as ViewportSize, icon: <Monitor size={13} /> },
            { v: 'tablet'  as ViewportSize, icon: <Tablet size={13} /> },
            { v: 'mobile'  as ViewportSize, icon: <Smartphone size={13} /> },
          ]).map(({ v, icon }) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28,
                background: viewport === v ? 'rgba(212,255,87,0.12)' : 'transparent',
                border: viewport === v ? '1px solid rgba(212,255,87,0.3)' : '1px solid transparent',
                color: viewport === v ? '#D4FF57' : 'rgba(240,237,230,0.65)',
                cursor: 'pointer', transition: 'all 0.15s', borderRadius: 0,
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Regenerate */}
        {lastPrompt && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.75)', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '5px 14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginRight: 8, height: 28,
            }}
          >
            <RotateCcw size={11} />
            Regenerate
          </button>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '5px 14px', cursor: 'pointer',
            transition: 'all 0.2s', height: 28, marginRight: 8,
          }}
          title="Reset Code to Original"
        >
          <RotateCcw size={11} />
          Reset
        </button>

        {/* Export */}
        <button
          onClick={() => exportHtml(html)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: '#22c55e', background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            padding: '5px 14px', cursor: 'pointer',
            transition: 'all 0.2s', height: 28, marginRight: 8,
          }}
          title="Export HTML Website"
        >
          <Download size={11} />
          Export
        </button>

        {/* Code toggle */}
        <button
          onClick={() => setShowMonaco(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            color: showMonaco ? '#D4FF57' : 'rgba(240,237,230,0.75)',
            background: showMonaco ? 'rgba(212,255,87,0.08)' : 'transparent',
            border: `1px solid ${showMonaco ? 'rgba(212,255,87,0.3)' : 'rgba(255,255,255,0.08)'}`,
            padding: '5px 14px', cursor: 'pointer',
            transition: 'all 0.2s', height: 28,
          }}
        >
          <Code2 size={11} />
          {showMonaco ? 'Hide Code' : 'Edit Code'}
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {panelSide === 'left' && promptPanel}

        {/* Center */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minWidth: 0 }}>

          {/* Browser chrome wrapper */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', minHeight: 0,
            padding: 12, gap: 8,
            background: 'var(--brand-dark)',
          }}>
            {/* Browser address bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0, padding: '8px 14px',
              background: 'var(--brand-surface-hover)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {/* Traffic lights */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
              </div>

              {/* Navigation controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(240,237,230,0.65)', marginLeft: 8 }}>
                <ArrowLeft size={13} style={{ cursor: 'not-allowed', opacity: 0.5 }} />
                <ArrowLeft size={13} style={{ cursor: 'not-allowed', opacity: 0.5, transform: 'rotate(180deg)' }} />
                <motion.div
                  animate={!isReady ? { rotate: 360 } : {}}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{ display: 'inline-flex' }}
                  onClick={() => { if (isReady) setRefreshTrigger(prev => prev + 1); }}
                >
                  <RotateCcw size={12} style={{ cursor: isReady ? 'pointer' : 'not-allowed', opacity: isReady ? 0.7 : 1 }} />
                </motion.div>
              </div>

              {/* URL bar */}
              <div style={{
                flex: 1, padding: '4px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 4,
                fontSize: 11, color: 'rgba(240,237,230,0.75)',
                fontFamily: 'monospace', letterSpacing: 0.3,
                display: 'flex', alignItems: 'center',
              }}>
                <Loader2 size={10} style={{ color: '#D4FF57', marginRight: 8, opacity: 0.8, animation: isReady ? 'none' : 'spin 1s linear infinite' }} />
                <span style={{ color: 'rgba(240,237,230,0.95)' }}>localhost:3001</span>
                <span style={{ color: 'rgba(240,237,230,0.6)' }}>/index.html</span>
                <span style={{ marginLeft: 'auto', color: 'rgba(240,237,230,0.45)' }}>· {vpLabel}</span>
              </div>

              {selectedSection && (
                <div style={{
                  fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                  color: '#D4FF57', border: '1px solid rgba(212,255,87,0.2)',
                  padding: '3px 10px',
                }}>
                  ◈ {selectedSection}
                </div>
              )}
            </div>

            {/* Preview pane */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
              <PreviewPane
                html={html}
                onSectionClick={(id) => onSectionSelect(id)}
                onConsoleError={(msg) => setConsoleErrors(prev => [...prev, msg])}
                viewport={viewport}
                selectedSectionId={selectedSection}
                hideHeader={true}
                refreshTrigger={refreshTrigger}
              />

              {/* Loading overlay */}
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
                      gap: 16, zIndex: 20,
                      background: 'rgba(7,7,7,0.88)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                      <Loader2 size={24} style={{ color: '#D4FF57' }} />
                    </motion.div>
                    <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.75)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      {status.status === 'booting' ? 'Booting sandbox...' :
                       status.status === 'installing' ? 'Installing dependencies...' : 'Starting server...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Section clear */}
              <AnimatePresence>
                {selectedSection && (
                  <motion.button
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onClick={() => onSectionSelect(null)}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px',
                      background: 'rgba(212,255,87,0.08)',
                      border: '1px solid rgba(212,255,87,0.2)',
                      color: '#D4FF57', fontSize: 10,
                      letterSpacing: 1.5, textTransform: 'uppercase',
                      fontWeight: 500, cursor: 'pointer', zIndex: 30,
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    ◈ {selectedSection} · clear
                  </motion.button>
                )}
              </AnimatePresence>

              {/* ── FLOATING PANEL TOGGLE (jab panel band ho) ── */}
              <AnimatePresence>
                {!isPanelOpen && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    onClick={() => setIsPanelOpen(true)}
                    title="Show Prompt Panel (Ctrl+B)"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      [panelSide === 'left' ? 'left' : 'right']: 12,
                      transform: 'translateY(-50%)',
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 6px',
                      background: 'rgba(212,255,87,0.08)',
                      border: '1px solid rgba(212,255,87,0.25)',
                      color: '#D4FF57',
                      cursor: 'pointer', zIndex: 30,
                      borderRadius: 4,
                      flexDirection: 'column',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    <PanelToggleIcon size={14} />
                    <span style={{
                      fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      color: 'rgba(212,255,87,0.7)',
                      marginTop: 4,
                    }}>
                      Panel
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Monaco resize handle */}
          <AnimatePresence>
            {showMonaco && (
              <div
                onMouseDown={startMonacoResize}
                className="glow-divider"
                style={{
                  width: 5, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'col-resize',
                  background: isResizingMonaco ? '#D4FF57' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
              </div>
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
                  background: 'var(--brand-surface)',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px',
                  background: 'var(--brand-surface-hover)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                  color: 'rgba(240,237,230,0.65)', height: 36, flexShrink: 0,
                }}>
                  <Code2 size={11} style={{ color: '#D4FF57' }} />
                  index.html
                  <span style={{ marginLeft: 'auto', color: 'rgba(240,237,230,0.45)' }}>HTML Editor</span>
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

      {/* ── STATUS BAR ── */}
      <div style={{
        background: 'var(--brand-surface)', padding: '6px 16px',
        display: 'flex', alignItems: 'center', gap: 20,
        flexShrink: 0, fontSize: 10,
        letterSpacing: 1.5, textTransform: 'uppercase',
        color: 'rgba(240,237,230,0.75)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isReady ? '#22c55e' : '#D4FF57',
            boxShadow: `0 0 8px ${isReady ? '#22c55e' : '#D4FF57'}`,
            display: 'inline-block',
          }} />
          <span style={{ color: 'rgba(240,237,230,0.85)' }}>WebContainer: {status.status}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: selectedSection ? '#D4FF57' : 'rgba(240,237,230,0.65)' }}>
          {selectedSection ? `Section: ${selectedSection}` : 'No Selection'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: consoleErrors.length > 0 ? '#ff5f57' : 'rgba(240,237,230,0.65)' }}>
          Errors: {consoleErrors.length}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>Size: {(html.length / 1024).toFixed(1)} KB</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>Latency: 14ms</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: isPanelOpen ? '#22c55e' : 'rgba(240,237,230,0.45)' }}>
          Panel: {isPanelOpen ? 'Open' : 'Hidden'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>Sandbox: Active</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', color: 'rgba(240,237,230,0.65)' }}>
          {viewport} · {vpLabel}
        </span>
      </div>

      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .glow-divider {
    transition: background 0.15s, box-shadow 0.15s;
  }
  .glow-divider:hover {
    background: #D4FF57 !important;
    box-shadow: 0 0 10px rgba(212, 255, 87, 0.8) !important;
  }
`}</style>
    </div>
  );
}
