import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Monitor, Tablet, Smartphone, Code2, Undo2, Redo2,
  RotateCcw, ArrowLeft, Download, ExternalLink, PanelLeftOpen, PanelLeftClose,
  PanelRightOpen, PanelRightClose, Sparkles, Terminal, Eye, X
} from 'lucide-react';
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
  tokenUsage?: any; // TokenUsageInfo | null, added for token bar
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
  tokenUsage,
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
  const [isMinimized, setIsMinimized] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable custom resizing on mobile – panel becomes a fixed bottom sheet
  const startPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isMobile) setIsResizingPanel(true);
  }, [isMobile]);

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
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizingPanel, panelSide]);

  const startMonacoResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isMobile) setIsResizingMonaco(true);
  }, [isMobile]);

  useEffect(() => {
    if (!isResizingMonaco) return;
    const onMove = (e: MouseEvent) => {
      setMonacoWidth(prev => {
        const newWidth = prev - e.movementX;
        return Math.max(300, Math.min(newWidth, 900));
      });
    };
    const onUp = () => setIsResizingMonaco(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizingMonaco]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsPanelOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    dragStartX.current = e.clientX;
    setIsDraggingPanel(true);
  }, [isMobile]);

  const toggleFullscreen = useCallback(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
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

  // Responsive panel width
  const effectivePanelWidth = isMobile ? windowWidth * 0.85 : panelWidth;

  const slideVariants = {
    open: { width: isMobile ? '100%' : effectivePanelWidth, opacity: 1, x: 0 },
    closed: {
      width: isMobile ? 0 : 0,
      opacity: isMobile ? 0 : 0,
      x: isMobile ? 0 : (panelSide === 'left' ? -panelWidth : panelWidth),
    },
  };

  const PanelToggleIcon = isPanelOpen
    ? (panelSide === 'left' ? PanelLeftClose : PanelRightClose)
    : (panelSide === 'left' ? PanelLeftOpen : PanelRightOpen);

  // ─── OPEN IN NEW TAB HANDLER ─────────────────────────────────────────────────
  const handleOpenInNewTab = useCallback(() => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    if (newTab) {
      // Clean up the object URL after the tab has loaded (optional)
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }, [html]);

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
        borderLeft: panelSide === 'right' && !isMobile ? '1px solid var(--border)' : 'none',
        borderRight: panelSide === 'left' && !isMobile ? '1px solid var(--border)' : 'none',
        borderTop: isMobile ? '1px solid var(--border)' : 'none',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 50 : 10,
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
        minWidth: 0,
        bottom: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        right: isMobile ? 0 : undefined,
        height: isMobile ? '85vh' : 'auto',
        borderTopLeftRadius: isMobile ? 16 : 0,
        borderTopRightRadius: isMobile ? 16 : 0,
        boxShadow: isMobile ? '0 -8px 32px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* Mobile close button */}
      {isMobile && isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(false)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>
      )}

      {!isMobile && (
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
      )}

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
          tokenUsage={tokenUsage}
        />
      </div>

      {!isMobile && (
        <div
          onMouseDown={startPanelResize}
          className="glow-divider"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 4,
            cursor: 'col-resize',
            zIndex: 20,
            [panelSide === 'left' ? 'right' : 'left']: 0,
            background: isResizingPanel ? 'var(--brand-primary)' : 'var(--border)',
            transition: 'background 0.15s',
          }}
        />
      )}
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
        background: 'var(--background)',
        userSelect: isResizingPanel || isResizingMonaco ? 'none' : undefined,
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 0,
          padding: isMobile ? '0 8px' : '0 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
          height: isMobile ? 48 : 52,
          overflowX: isMobile ? 'auto' : 'visible',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Panel toggle button (only on larger screens) */}
        {!isSmallMobile && (
          <button
            onClick={() => setIsPanelOpen(v => !v)}
            title={`${isPanelOpen ? 'Hide' : 'Show'} Prompt Panel (Ctrl+B)`}
            className="toolbar-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              background: isPanelOpen ? 'rgba(var(--brand-primary-rgb), 0.1)' : 'transparent',
              border: isPanelOpen ? `1px solid rgba(var(--brand-primary-rgb), 0.25)` : '1px solid transparent',
              color: isPanelOpen ? 'var(--brand-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: 8,
              marginRight: 6,
            }}
          >
            <PanelToggleIcon size={15} />
          </button>
        )}

        {!isMobile && <div style={{ width: 1, height: 24, background: 'var(--border)', marginRight: 12, flexShrink: 0 }} />}

        {/* Undo / Redo (hidden on small mobile) */}
        {!isSmallMobile && (
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: btn.disabled ? 'rgba(255,255,255,0.15)' : 'var(--text-muted)',
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  borderRadius: 8,
                }}
                onMouseEnter={e => { if (!btn.disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}

        {!isMobile && <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 12px', flexShrink: 0 }} />}

        {/* Viewport switcher */}
        <div style={{ display: 'flex', gap: isMobile ? 2 : 6, background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: 10 }}>
          {([
            { v: 'desktop' as ViewportSize, icon: <Monitor size={isMobile ? 12 : 14} /> },
            { v: 'tablet' as ViewportSize, icon: <Tablet size={isMobile ? 12 : 14} /> },
            { v: 'mobile' as ViewportSize, icon: <Smartphone size={isMobile ? 12 : 14} /> },
          ]).map(({ v, icon }) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className="toolbar-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                background: viewport === v ? 'rgba(var(--brand-primary-rgb), 0.15)' : 'transparent',
                border: 'none',
                color: viewport === v ? 'var(--brand-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRadius: 8,
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Back to Dashboard button – top right, always visible */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: isMobile ? 10 : 11,
            fontWeight: 500,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: isMobile ? '4px 8px' : '6px 14px',
            background: 'rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
            marginRight: 8,
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--brand-primary)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--brand-primary)';
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(var(--brand-primary-rgb), 0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.15)';
          }}
        >
          <ArrowLeft size={isMobile ? 12 : 14} />
          <span>{isSmallMobile ? 'Back' : 'Dashboard'}</span>
        </Link>

        {/* Export button – ALWAYS VISIBLE */}
        <button
          onClick={() => exportHtml(html)}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            padding: isMobile ? '4px 8px' : '6px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: 20,
            height: isMobile ? 28 : 34,
            marginRight: 8,
          }}
          title="Export HTML Website"
        >
          <Download size={12} />
          {!isSmallMobile && <span>Export</span>}
        </button>

        {/* ─── NEW: Open in New Tab button ────────────────────────────────────── */}
        <button
          onClick={handleOpenInNewTab}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#3b82f6',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.3)',
            padding: isMobile ? '4px 8px' : '6px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: 20,
            height: isMobile ? 28 : 34,
            marginRight: 8,
          }}
          title="Open preview in a new tab"
        >
          <ExternalLink size={12} />
          {!isSmallMobile && <span>New Tab</span>}
        </button>

        {/* Regenerate (only if lastPrompt and not generating) – hidden on small mobile to save space */}
        {lastPrompt && !isGenerating && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="toolbar-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border)',
              padding: isMobile ? '4px 8px' : '6px 16px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginRight: 8,
              borderRadius: 20,
              height: isMobile ? 28 : 34,
            }}
          >
            <RotateCcw size={12} />
            {!isSmallMobile && <span>Regen</span>}
          </button>
        )}

        {/* Reset button */}
        <button
          onClick={onReset}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: isMobile ? '4px 8px' : '6px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: 20,
            height: isMobile ? 28 : 34,
            marginRight: 8,
          }}
          title="Reset Code to Original"
        >
          <RotateCcw size={12} />
          {!isSmallMobile && <span>Reset</span>}
        </button>

        {/* Code toggle button – ALWAYS VISIBLE */}
        <button
          onClick={() => setShowMonaco(v => !v)}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: showMonaco ? 'var(--brand-primary)' : 'var(--text-muted)',
            background: showMonaco ? 'rgba(var(--brand-primary-rgb), 0.1)' : 'transparent',
            border: `1px solid ${showMonaco ? 'rgba(var(--brand-primary-rgb), 0.3)' : 'var(--border)'}`,
            padding: isMobile ? '4px 8px' : '6px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: 20,
            height: isMobile ? 28 : 34,
          }}
        >
          <Code2 size={12} />
          <span style={{ fontSize: isMobile ? 9 : 11 }}>
            {showMonaco ? 'Hide Code' : 'Code'}
          </span>
        </button>
      </div>

      {/* Body – unchanged from previous responsive version */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {panelSide === 'left' && !isMobile && promptPanel}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minWidth: 0 }}>
          <div className="preview-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: isMobile ? 0 : 4 }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0,
                padding: isMobile ? '4px' : 12,
                gap: isMobile ? 6 : 12,
                background: 'var(--background)',
              }}
            >
              {/* Browser address bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 16,
                  flexShrink: 0,
                  padding: isMobile ? '6px 8px' : '8px 16px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: isMobile ? 4 : 0,
                }}
              >
                <div style={{ display: 'flex', gap: isMobile ? 5 : 8 }}>
                  {[
                    { color: '#ff5f57', glow: 'rgba(255,95,87,0.6)', title: 'Refresh Preview', action: () => setRefreshTrigger(p => p + 1) },
                    { color: '#febc2e', glow: 'rgba(254,188,46,0.6)', title: isMinimized ? 'Expand Preview' : 'Minimize Preview', action: () => setIsMinimized(v => !v) },
                    { color: '#28c840', glow: 'rgba(40,200,64,0.6)', title: 'Toggle Fullscreen', action: toggleFullscreen },
                  ].map(({ color, glow, title, action }) => (
                    <div
                      key={color}
                      onClick={action}
                      title={title}
                      style={{
                        width: isMobile ? 8 : 11,
                        height: isMobile ? 8 : 11,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: '0 0 2px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.3)';
                        e.currentTarget.style.boxShadow = `0 0 8px ${glow}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 2px rgba(0,0,0,0.2)';
                      }}
                    />
                  ))}
                </div>

                {!isSmallMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                    <ArrowLeft
                      size={14}
                      title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
                      style={{
                        cursor: canUndo ? 'pointer' : 'not-allowed',
                        opacity: canUndo ? 0.7 : 0.4,
                        transition: 'all 0.15s',
                      }}
                      onClick={() => { if (canUndo) onUndo(); }}
                      onMouseEnter={e => { if (canUndo) e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = canUndo ? '0.7' : '0.4'; }}
                    />
                    <ArrowLeft
                      size={14}
                      title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}
                      style={{
                        cursor: canRedo ? 'pointer' : 'not-allowed',
                        opacity: canRedo ? 0.7 : 0.4,
                        transform: 'rotate(180deg)',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => { if (canRedo) onRedo(); }}
                      onMouseEnter={e => { if (canRedo) e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = canRedo ? '0.7' : '0.4'; }}
                    />
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    padding: isMobile ? '4px 8px' : '6px 14px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    fontSize: isMobile ? 10 : 11,
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                    letterSpacing: 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    overflow: 'hidden',
                  }}
                >
                  {previewMethod === 'webcontainer' && (
                    <Loader2 size={11} style={{ color: 'var(--brand-primary)', animation: isReady ? 'none' : 'spin 1s linear infinite' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {previewMethod === 'webcontainer' ? 'localhost:3001' : 'live preview'}
                  </span>
                  {!isSmallMobile && <span style={{ color: 'var(--text-muted)' }}>/index.html</span>}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isSmallMobile ? vpLabel.replace('px', '') : `· ${vpLabel}`}
                  </span>
                </div>

                {selectedSection && !isSmallMobile && (
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'var(--brand-primary)',
                      border: `1px solid rgba(var(--brand-primary-rgb), 0.25)`,
                      padding: '4px 14px',
                      background: 'rgba(var(--brand-primary-rgb), 0.05)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ◈ {selectedSection}
                  </div>
                )}
              </div>

              {/* Preview pane */}
              <div ref={previewContainerRef} style={{ position: 'relative', flex: isMinimized ? 'none' : 1, height: isMinimized ? 48 : undefined, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: isMinimized ? 'none' : '0 8px 24px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
                {isMinimized && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', zIndex: 40, gap: 8, color: 'var(--text-muted)', fontSize: 12, letterSpacing: 1 }}>
                    <Sparkles size={14} style={{ color: 'var(--brand-primary)' }} />
                    <span>Preview minimized</span>
                  </div>
                )}
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
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        zIndex: 20,
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
                  {selectedSection && !isSmallMobile && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => onSectionSelect(null)}
                      className="hover-glow"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 14px',
                        background: 'rgba(var(--brand-primary-rgb), 0.12)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid rgba(var(--brand-primary-rgb), 0.3)`,
                        color: 'var(--brand-primary)',
                        fontSize: 10,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        cursor: 'pointer',
                        zIndex: 30,
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
                        [panelSide === 'left' ? 'left' : 'right']: 12,
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        background: 'rgba(var(--brand-primary-rgb), 0.12)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid rgba(var(--brand-primary-rgb), 0.3)`,
                        color: 'var(--brand-primary)',
                        cursor: 'pointer',
                        zIndex: 30,
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

          {/* Monaco resize handle (only desktop) */}
          <AnimatePresence>
            {showMonaco && !isMobile && (
              <div
                onMouseDown={startMonacoResize}
                className="glow-divider"
                style={{
                  width: 4,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                animate={{
                  width: isMobile ? '100%' : monacoWidth,
                  opacity: 1,
                  x: 0,
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--surface)',
                  borderLeft: isMobile ? 'none' : '1px solid var(--border)',
                  borderTop: isMobile ? '1px solid var(--border)' : 'none',
                  margin: isMobile ? '0' : '4px 4px 4px 0',
                  position: isMobile ? 'absolute' : 'relative',
                  top: isMobile ? 0 : undefined,
                  right: isMobile ? 0 : undefined,
                  bottom: isMobile ? 0 : undefined,
                  zIndex: 40,
                  height: isMobile ? '100%' : 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: isMobile ? '8px 12px' : '10px 18px',
                    background: 'var(--surface-elevated)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    height: 44,
                    flexShrink: 0,
                  }}
                >
                  <Code2 size={13} style={{ color: 'var(--brand-primary)' }} />
                  index.html
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10 }}>HTML Editor</span>
                  {isMobile && (
                    <button
                      onClick={() => setShowMonaco(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        marginLeft: 4,
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <MonacoEditor value={html} onChange={onCodeChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {panelSide === 'right' && !isMobile && promptPanel}
      </div>

      {/* Status bar (hidden on mobile) */}
      {!isMobile && (
        <div
          style={{
            background: 'var(--surface)',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexShrink: 0,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border)',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isReady ? '#22c55e' : 'var(--brand-primary)',
                boxShadow: `0 0 8px ${isReady ? '#22c55e' : 'var(--brand-primary)'}`,
                display: 'inline-block',
              }}
            />
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
      )}

      {/* Mobile FAB – LEFT SIDE, only when panel is closed */}
      {isMobile && !isPanelOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 60,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPanelOpen(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 0 20px rgba(var(--brand-primary-rgb), 0.5)`,
              color: '#080808',
            }}
          >
            <Sparkles size={24} />
          </motion.button>
        </div>
      )}

      {/* Mobile prompt panel (bottom sheet) */}
      {isMobile && isPanelOpen && promptPanel}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        
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

        /* Hide scrollbar on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </div>
  );
}