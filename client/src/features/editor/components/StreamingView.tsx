import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, FileCode, FileJson, FileText, Coffee, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StreamingFile {
  name: string;
  content: string;
  language: string;
}

interface StreamingViewProps {
  files: StreamingFile[];
  isStreaming: boolean;
  onPreview: () => void;
  projectName?: string;
  error?: string | null;
  theme?: 'dark' | 'light';
}

const AI_MESSAGES = [
  'Thinking about your website...',
  'Writing HTML structure and navbar...',
  'Crafting hero section with styles...',
  'Designing content and cards...',
  'Adding footer and final touches. Almost done!',
];

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const prevText = useRef('');
  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return displayed;
}

function highlightCode(line: string, isLight: boolean): React.ReactNode {
  let html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  if (isLight) {
    // Light theme syntax colors (no grey)
    html = html
      .replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#a626a4">$1$2</span>')
      .replace(/([\w-]+=)(".*?")/g, '<span style="color:#50a14f">$1</span><span style="color:#986801">$2</span>')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#8b8f9c; font-style:italic">$1</span>')
      .replace(/(\/\*.*?\*\/|\/\/.*)/g, '<span style="color:#8b8f9c">$&</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|export|import|from|default)\b/g, '<span style="color:#a626a4">$1</span>')
      .replace(/\b(true|false|null|undefined|this)\b/g, '<span style="color:#986801">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#986801">$1</span>');
  } else {
    // Dark theme syntax colors
    html = html
      .replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#c678dd">$1$2</span>')
      .replace(/([\w-]+=)(".*?")/g, '<span style="color:#e5c07b">$1</span><span style="color:#98c379">$2</span>')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#5c6370; font-style:italic">$1</span>')
      .replace(/(\/\*.*?\*\/|\/\/.*)/g, '<span style="color:#5c6370">$&</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|export|import|from|default)\b/g, '<span style="color:#c678dd">$1</span>')
      .replace(/\b(true|false|null|undefined|this)\b/g, '<span style="color:#d19a66">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#d19a66">$1</span>');
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function StreamingView({ files, isStreaming, onPreview, error, theme = 'dark' }: StreamingViewProps) {
  const [copied, setCopied] = useState(false);
  const codeBodyRef = useRef<HTMLDivElement>(null);
  const activeFile = files[0];
  const allLines = activeFile?.content.split('\n') ?? [];

  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const prevLinesLength = useRef(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    const newLength = allLines.length;
    if (newLength > prevLinesLength.current) {
      let current = prevLinesLength.current;
      const interval = setInterval(() => {
        current++;
        setVisibleLineCount(current);
        if (current >= newLength) clearInterval(interval);
      }, 22);
      animationRef.current = interval;
    } else if (newLength < prevLinesLength.current) {
      setVisibleLineCount(newLength);
    }
    prevLinesLength.current = newLength;
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [allLines.length]);

  useEffect(() => {
    if (codeBodyRef.current && visibleLineCount > 0) {
      codeBodyRef.current.scrollTo({ top: codeBodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleLineCount]);

  const visibleLines = allLines.slice(0, visibleLineCount);
  const isDone = !isStreaming && allLines.length > 0 && !error;
  const maxExpectedLines = 320;
  const progress = isStreaming ? Math.min(visibleLineCount / maxExpectedLines, 0.95) : isDone ? 1 : 0;
  const percentComplete = Math.floor(progress * 100);

  const msgIdx = Math.min(Math.floor(progress * AI_MESSAGES.length), AI_MESSAGES.length - 1);
  const currentAiMsg = isStreaming
    ? AI_MESSAGES[msgIdx]
    : error ? 'Generation failed.' : allLines.length > 0
      ? '✦ Your website is ready — open preview to see it live.'
      : AI_MESSAGES[0];
  const displayedMsg = useTypewriter(currentAiMsg, 18);

  const handleCopy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (_fileName: string, lang: string) => {
    if (lang === 'html') return <FileCode size={14} />;
    if (lang === 'css') return <FileCode size={14} style={{ color: isLight ? '#2563eb' : '#3b82f6' }} />;
    if (lang === 'js' || lang === 'jsx') return <FileCode size={14} style={{ color: isLight ? '#ca8a04' : '#eab308' }} />;
    if (lang === 'json') return <FileJson size={14} />;
    if (lang === 'md') return <FileText size={14} />;
    return <FileCode size={14} />;
  };

  // Theme-specific styles: light theme has NO GREY
  const themeStyles = {
    dark: {
      bg: 'var(--background)',
      surface: 'var(--surface)',
      border: 'var(--border)',
      textPrimary: 'var(--text-primary)',
      textMuted: 'var(--text-muted)',
      brand: 'var(--brand-primary)',
      brandGradient: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
      codeBg: 'rgba(0,0,0,0.25)',
      codeHeaderBg: 'rgba(0,0,0,0.3)',
      gridOverlay: `linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)`,
      aura1: `linear-gradient(135deg, var(--brand-primary) 0%, transparent 60%)`,
      aura2: `linear-gradient(225deg, var(--brand-accent) 0%, transparent 60%)`,
    },
    light: {
      bg: '#ffffff',
      surface: '#ffffff',
      border: '#e0e7ff',           // light purple border
      textPrimary: '#0f172a',      // dark slate
      textMuted: '#4c1d95',        // deep purple for muted text (brand-like)
      brand: '#6c63ff',
      brandGradient: 'linear-gradient(135deg, #6c63ff, #8b85ff)',
      codeBg: '#ffffff',
      codeHeaderBg: '#faf5ff',     // very light purple background
      gridOverlay: `linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)`,
      aura1: `linear-gradient(135deg, rgba(108,99,255,0.1) 0%, transparent 60%)`,
      aura2: `linear-gradient(225deg, rgba(108,99,255,0.08) 0%, transparent 60%)`,
    },
  };

  const styles = themeStyles[theme];

  return (
    <div style={{
      width: '100%', height: '100%', background: styles.bg, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', fontFamily: 'DM Sans, sans-serif', position: 'relative',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: styles.gridOverlay,
        backgroundSize: '72px 72px',
        maskImage: isLight ? 'none' : 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)',
      }} />

      {/* Aurora blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 700, height: 400,
          background: styles.aura1,
          borderRadius: '50%', filter: 'blur(90px)',
          top: -120, left: -200, opacity: isLight ? 1 : 0.1,
          animation: isLight ? 'none' : 'aFloat1 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          background: styles.aura2,
          borderRadius: '50%', filter: 'blur(90px)',
          bottom: -50, right: -100, opacity: isLight ? 1 : 0.08,
          animation: isLight ? 'none' : 'aFloat2 26s ease-in-out infinite',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 2, flexShrink: 0,
        borderBottom: `1px solid ${styles.border}`,
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: 20,
        background: isLight ? styles.surface : 'rgba(var(--surface-rgb, 15, 20, 30), 0.7)',
        backdropFilter: isLight ? 'none' : 'blur(12px)',
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: styles.brandGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px rgba(108,99,255,0.2)`,
          }}>
            <Coffee size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: isLight ? '#0f172a' : 'white' }}>
            Capstone<span style={{ color: styles.brand }}>-Shery</span>
          </span>
        </Link>
        <div style={{ height: 24, width: 1, background: styles.border }} />
        <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: styles.textMuted }}>
          Live Stream
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: isLight ? '#f5f3ff' : 'rgba(0,0,0,0.3)',
            padding: '4px 14px', borderRadius: 40,
            border: `1px solid ${styles.border}`,
          }}>
            <span style={{ fontSize: 11, color: styles.textPrimary }}>{activeFile?.name ?? 'index.html'}</span>
            {allLines.length > 0 && <span style={{ fontSize: 10, color: styles.brand }}>{percentComplete}%</span>}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            border: `1px solid ${isDone ? (isLight ? '#d1fae5' : 'rgba(34,197,94,0.3)') : (isLight ? '#e0e7ff' : 'rgba(108,99,255,0.3)')}`,
            borderRadius: 40, fontSize: 10, fontWeight: 500, letterSpacing: 1.5,
            color: isDone ? (isLight ? '#059669' : '#22c55e') : styles.brand,
            background: isDone ? (isLight ? '#ecfdf5' : 'rgba(34,197,94,0.05)') : (isLight ? '#f5f3ff' : 'rgba(108,99,255,0.05)'),
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isDone ? (isLight ? '#059669' : '#22c55e') : styles.brand,
              animation: isStreaming ? 'blink 1.4s step-end infinite' : 'none',
            }} />
            {isDone ? 'Completed' : isStreaming ? 'Generating' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 2, minHeight: 0 }}>

        {/* LEFT — AI Assistant */}
        <div style={{
          width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${styles.border}`,
          padding: '28px 20px', overflowY: 'auto', gap: 28,
          background: isLight ? '#faf5ff' : 'rgba(0,0,0,0.2)',
          backdropFilter: isLight ? 'none' : 'blur(4px)',
        }}>
          {/* Chat bubble */}
          <div style={{
            background: isLight ? '#ffffff' : 'var(--surface)',
            border: `1px solid ${styles.border}`,
            borderRadius: 24, padding: 20,
            boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.02)' : '0 12px 28px -8px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: styles.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: 'white',
                boxShadow: `0 2px 8px rgba(108,99,255,0.2)`,
              }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: styles.brand, marginBottom: 6 }}>
                  Shery AI
                </div>
                <div style={{ fontSize: 14, fontWeight: isLight ? 400 : 300, color: styles.textPrimary, lineHeight: 1.65, minHeight: 60 }}>
                  {displayedMsg}
                  {isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ display: 'inline-block', width: 2, height: 14, background: styles.brand, borderRadius: 1, marginLeft: 4, verticalAlign: 'middle' }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && !isStreaming && (
            <div style={{
              padding: '14px 18px', background: isLight ? '#fef2f2' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isLight ? '#fecaca' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 16, color: isLight ? '#dc2626' : '#f87171', fontSize: 13, lineHeight: 1.6,
            }}>
              <strong>⚠️ Generation failed</strong><br />{error}
            </div>
          )}

          {/* Progress steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 8 }}>
            <div style={{
              position: 'absolute', left: 20, top: 20, bottom: 20, width: 1.5,
              background: `linear-gradient(to bottom, ${styles.brand}, ${isLight ? '#e9d5ff' : 'transparent'})`,
              zIndex: 0,
            }} />
            {['Parsing prompt', 'Scaffolding HTML', 'Applying styles', 'Finalizing output'].map((step, i) => {
              const stepProgress = progress * 4;
              const done = stepProgress > i + 1;
              const active = stepProgress > i && stepProgress <= i + 1;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                    background: done ? styles.brand : active ? (isLight ? '#ede9fe' : 'rgba(108,99,255,0.2)') : (isLight ? '#f8fafc' : 'rgba(255,255,255,0.05)'),
                    border: `1px solid ${done ? 'transparent' : active ? styles.brand : (isLight ? '#e0e7ff' : 'var(--border)')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: done ? 'white' : active ? styles.brand : (isLight ? '#4c1d95' : 'var(--text-muted)'),
                  }}>
                    {done ? '✓' : active ? <Sparkles size={12} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    color: done ? styles.textPrimary : active ? styles.brand : styles.textMuted,
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress card */}
          {allLines.length > 0 && (
            <div style={{
              background: isLight ? '#ffffff' : 'rgba(0,0,0,0.3)',
              border: `1px solid ${styles.border}`,
              borderRadius: 20, padding: 18,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: styles.textMuted, marginBottom: 12 }}>
                Generation Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: styles.brand, lineHeight: 1, letterSpacing: 2 }}>
                  {percentComplete}%
                </span>
                <span style={{ fontSize: 11, color: styles.textMuted }}>complete</span>
              </div>
              <div style={{ height: 4, background: isLight ? '#e9d5ff' : 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${styles.brand}, #8b85ff)`, borderRadius: 4 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE — File Tree */}
        <div style={{
          width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${styles.border}`,
          background: isLight ? '#ffffff' : 'rgba(0,0,0,0.15)',
          padding: '28px 16px', gap: 18, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: styles.textMuted, fontWeight: 600 }}>
            Workspace
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {files.length === 0 ? (
              <div style={{ fontSize: 12, color: styles.textMuted, padding: 8 }}>Waiting for files...</div>
            ) : (
              files.map(file => {
                const isActive = activeFile?.name === file.name;
                return (
                  <motion.div
                    key={file.name}
                    whileHover={{ x: 2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      background: isActive ? (isLight ? '#f5f3ff' : 'rgba(108,99,255,0.12)') : 'transparent',
                      border: `1px solid ${isActive ? (isLight ? '#e0e7ff' : 'rgba(108,99,255,0.25)') : 'transparent'}`,
                      borderRadius: 12, cursor: 'default', transition: 'all 0.15s',
                      color: isActive ? styles.brand : styles.textMuted,
                    }}
                  >
                    {getFileIcon(file.name, file.language)}
                    <span style={{ flex: 1, fontSize: 12, fontWeight: isActive ? 500 : 400, letterSpacing: 0.3 }}>{file.name}</span>
                    {isActive && isStreaming && (
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%', background: styles.brand,
                        boxShadow: `0 0 0 2px rgba(108,99,255,0.2)`, animation: 'blink 1.4s step-end infinite',
                      }} />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT — Code Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, margin: 2 }}>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)',
            border: `1px solid ${isLight ? '#e0e7ff' : 'rgba(108,99,255,0.2)'}`,
            borderRadius: 16, overflow: 'hidden', margin: 8,
            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.02)' : '0 12px 32px -12px rgba(0,0,0,0.5)',
          }}>
            {/* Code header */}
            <div style={{
              padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${styles.border}`,
              background: isLight ? '#faf5ff' : 'rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontSize: 12, color: styles.textMuted, letterSpacing: 0.5 }}>{activeFile?.name ?? 'index.html'}</span>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                  color: copied ? (isLight ? '#059669' : '#22c55e') : styles.textMuted,
                  background: isLight ? '#f5f3ff' : 'transparent',
                  border: `1px solid ${styles.border}`,
                  padding: '5px 12px', borderRadius: 30, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>

            {/* Code body */}
            <div
              ref={codeBodyRef}
              style={{
                flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 0',
                fontFamily: '"Fira Code", "Cascadia Code", monospace', fontSize: 12.5, lineHeight: 1.6,
                background: isLight ? '#ffffff' : 'transparent',
              }}
            >
              {visibleLines.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ width: 32, height: 32, border: `2px solid ${styles.border}`, borderTopColor: styles.brand, borderRadius: '50%' }}
                  />
                  <span style={{ fontSize: 12, color: styles.textMuted, letterSpacing: 1.5 }}>Awaiting code stream...</span>
                </div>
              ) : (
                visibleLines.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                    style={{ display: 'flex', paddingRight: 20, minHeight: 24 }}
                  >
                    <span style={{
                      minWidth: 48, paddingRight: 16, textAlign: 'right',
                      color: isLight ? '#cbd5e6' : 'rgba(255,255,255,0.12)',
                      fontSize: 11, userSelect: 'none', flexShrink: 0, fontFamily: 'monospace',
                    }}>{idx + 1}</span>
                    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: styles.textPrimary, flex: 1 }}>
                      {highlightCode(line || ' ', isLight)}
                    </span>
                    {isStreaming && idx === visibleLines.length - 1 && visibleLineCount < allLines.length && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        style={{ width: 2, height: 14, background: styles.brand, borderRadius: 1, marginLeft: 6, alignSelf: 'center' }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        position: 'relative', zIndex: 2, flexShrink: 0,
        borderTop: `1px solid ${styles.border}`,
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isLight ? '#ffffff' : 'rgba(0,0,0,0.5)',
        backdropFilter: isLight ? 'none' : 'blur(12px)',
      }}>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: styles.textMuted }}>
          {isStreaming ? '⚡ Streaming live' : isDone ? '✅ Build complete' : '⏳ Ready'}
        </span>
        <AnimatePresence>
          {isDone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPreview}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 11, fontWeight: 600, letterSpacing: 2,
                color: 'white', background: `linear-gradient(135deg, ${styles.brand}, #8b85ff)`,
                border: 'none', padding: '10px 28px', borderRadius: 40, cursor: 'pointer',
                boxShadow: `0 2px 8px rgba(108,99,255,0.25)`,
              }}
            >
              <Eye size={13} />
              Open Preview
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes aFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,40px) scale(1.08)} }
        @keyframes aFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,-60px) scale(1.1)} }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${isLight ? '#f1e6ff' : 'rgba(255,255,255,0.02)'}; }
        ::-webkit-scrollbar-thumb { background: ${isLight ? '#c4b5fd' : 'var(--brand-primary)'}; border-radius: 10px; }
      `}</style>
    </div>
  );
}