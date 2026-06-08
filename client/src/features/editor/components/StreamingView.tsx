import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, ArrowLeft } from 'lucide-react';
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

function colorize(line: string): React.ReactNode {
  const html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#569cd6">$1$2</span>')
    .replace(/([\w-]+=)(".*?")/g, '<span style="color:#9cdcfe">$1</span><span style="color:#ce9178">$2</span>')
    .replace(/(\/\*.*?\*\/|\/\/.*)/g, '<span style="color:#6a9955">$&</span>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function StreamingView({ files, isStreaming, onPreview, error }: StreamingViewProps) {
  const [copied, setCopied] = useState(false);
  const codeBodyRef = useRef<HTMLDivElement>(null);
  const activeFile = files[0];
  const lines = activeFile?.content.split('\n') ?? [];

  const isDone = !isStreaming && lines.length > 0 && !error;
  const progress = isStreaming
    ? Math.min(lines.length / 300, 0.95)
    : isDone ? 1 : 0;
  const msgIdx = Math.min(Math.floor(progress * AI_MESSAGES.length), AI_MESSAGES.length - 1);
  const currentAiMsg = isStreaming
    ? AI_MESSAGES[msgIdx]
    : error ? 'Generation failed.' : lines.length > 0
      ? '✦ Your website is ready — open preview to see it live.'
      : AI_MESSAGES[0];

  const displayedMsg = useTypewriter(currentAiMsg, 18);

  useEffect(() => {
    if (isStreaming && codeBodyRef.current) {
      codeBodyRef.current.scrollTop = codeBodyRef.current.scrollHeight;
    }
  }, [lines.length, isStreaming]);

  const handleCopy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'var(--brand-darker)',
      display: 'flex',
      flexDirection: 'column',
      // ── KEY FIX: contain all children, no bleed ──
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      position: 'relative',
    }}>
      {/* grid bg */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* top bar */}
      <div style={{
        position: 'relative', zIndex: 2, flexShrink: 0,
        borderBottom: '1px solid var(--brand-border)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--brand-dark)',
      }}>
        <Link
          to="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f0ede6', textDecoration: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
        >
          <ArrowLeft size={14} style={{ color: '#D4FF57' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3 }}>
            Capstone<span style={{ color: '#D4FF57' }}>-Shery</span>
          </span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 16 }}>|</span>
        <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(240,237,230,0.7)' }}>
          Generating
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.65)', letterSpacing: 0.5 }}>
            {activeFile?.name ?? 'index.html'}
            {lines.length > 0 && ` · ${lines.length} lines`}
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            border: `1px solid ${isDone ? 'rgba(34,197,94,0.25)' : 'rgba(212,255,87,0.2)'}`,
            fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase',
            color: isDone ? '#22c55e' : '#D4FF57',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isDone ? '#22c55e' : '#D4FF57',
              animation: isStreaming ? 'blink 1s step-end infinite' : 'none',
              display: 'inline-block',
            }} />
            {isDone ? 'Done' : 'Live'}
          </div>
        </div>
      </div>

      {/* split layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        // ── KEY FIX: overflow hidden so children can't push height ──
        overflow: 'hidden',
        position: 'relative', zIndex: 2,
        minHeight: 0,
      }}>

        {/* LEFT — AI chat */}
        <div style={{
          width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--brand-border)',
          padding: '32px 24px',
          overflowY: 'auto',
          overflowX: 'hidden',
          gap: 28,
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{
            display: 'flex', gap: 14,
            background: 'var(--brand-glass-card)',
            border: '1px solid var(--brand-border)',
            borderRadius: 14, padding: 20,
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6C63FF, #ff6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 2,
              boxShadow: '0 0 12px rgba(108,99,255,0.3)',
            }}>S</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(240,237,230,0.75)', marginBottom: 6 }}>
                Shery AI
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 300, color: '#f0ede6', lineHeight: 1.75, minHeight: 24 }}>
                {displayedMsg}
                {isStreaming && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    style={{ display: 'inline-block', width: 2, height: 15, background: '#D4FF57', borderRadius: 1, verticalAlign: 'text-bottom', marginLeft: 2 }}
                  />
                )}
              </div>
            </div>
          </div>

          {error && !isStreaming && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: 13, lineHeight: 1.6, borderRadius: 8,
            }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>Generation failed</strong>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 8 }}>
            <div style={{ position: 'absolute', left: 17, top: 18, bottom: 18, width: 1, background: 'var(--brand-border)', zIndex: 0 }} />
            {['Parsing prompt', 'Scaffolding HTML', 'Applying styles', 'Finalizing output'].map((step, i) => {
              const stepProgress = progress * 4;
              const done = stepProgress > i + 1;
              const active = stepProgress > i && stepProgress <= i + 1;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
                    border: `1px solid ${done ? '#D4FF57' : active ? 'rgba(212,255,87,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    background: done ? '#D4FF57' : 'var(--brand-darker)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: done ? '#080808' : 'transparent',
                    transition: 'all 0.3s',
                    boxShadow: active ? '0 0 10px rgba(212,255,87,0.2)' : 'none',
                  }}>
                    {done && '✓'}
                    {active && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4FF57', animation: 'blink 1s step-end infinite', display: 'inline-block' }} />
                    )}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 300, letterSpacing: 0.5, color: done ? 'rgba(240,237,230,0.85)' : active ? '#D4FF57' : 'rgba(240,237,230,0.65)', transition: 'color 0.3s' }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {lines.length > 0 && (
            <div style={{ background: 'var(--brand-glass)', border: '1px solid var(--brand-border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(240,237,230,0.7)', marginBottom: 4 }}>
                Lines Generated
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#D4FF57', lineHeight: 1, letterSpacing: 1, textShadow: '0 0 12px rgba(212,255,87,0.15)' }}>
                  {lines.length}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.7)', letterSpacing: 0.5 }}>lines parsed successfully</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                <motion.div
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6C63FF, #D4FF57)', borderRadius: 2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE — File tree */}
        <div style={{
          width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--brand-border)',
          background: 'var(--brand-dark)',
          padding: '24px 16px', gap: 16,
          userSelect: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(240,237,230,0.7)', fontWeight: 600 }}>
            Workspace Files
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.length === 0 ? (
              <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', letterSpacing: 0.5 }}>Waiting...</span>
            ) : (
              files.map(file => {
                const isActive = activeFile?.name === file.name;
                const icon =
                  file.language === 'html' ? '🌐' : file.language === 'css' ? '🎨' :
                  file.language === 'js' ? '⚡' : file.language === 'jsx' ? '⚛️' :
                  file.language === 'tsx' ? '⚛️' : file.language === 'ts' ? '🔷' :
                  file.language === 'json' ? '📋' : file.language === 'md' ? '📝' : '📄';
                return (
                  <div key={file.name} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px',
                    background: isActive ? 'rgba(212,255,87,0.06)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(212,255,87,0.15)' : 'transparent'}`,
                    color: isActive ? '#D4FF57' : 'rgba(240,237,230,0.65)',
                    fontSize: 12, cursor: 'default', transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span style={{ flex: 1, fontSize: 11.5, letterSpacing: 0.3 }}>{file.name}</span>
                    {isActive && isStreaming && (
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D4FF57', boxShadow: '0 0 6px #D4FF57', display: 'inline-block', animation: 'blink 1s step-end infinite' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT — Code panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // ── KEY FIX: must not grow beyond parent ──
          overflow: 'hidden',
          minWidth: 0,
          background: 'var(--brand-surface)',
        }}>
          {/* code header */}
          <div style={{
            padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--brand-border)',
            background: 'var(--brand-dark)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.7)', letterSpacing: 0.5 }}>
                {activeFile?.name ?? 'index.html'}
              </span>
            </div>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                color: copied ? '#22c55e' : 'rgba(240,237,230,0.7)',
                background: 'transparent', border: '1px solid var(--brand-border)',
                padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* code body — ── KEY FIX: overflow-y scroll, overflow-x hidden, wrap lines ── */}
          <div
            ref={codeBodyRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',   // no horizontal scroll
              padding: '16px 0',
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
              minHeight: 0,
            }}
          >
            {lines.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4FF57', opacity: 0.5 }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.65)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Waiting for output...
                </span>
              </div>
            ) : (
              lines.map((line, i) => (
                <div key={i} style={{ display: 'flex', minHeight: 20, paddingRight: 16 }}>
                  <span style={{
                    minWidth: 40, paddingRight: 16, textAlign: 'right',
                    color: 'rgba(255,255,255,0.1)', fontSize: 11.5, lineHeight: '20px',
                    userSelect: 'none', flexShrink: 0, fontFamily: 'monospace',
                  }}>
                    {i + 1}
                  </span>
                  {/* ── KEY FIX: pre-wrap wraps long lines, no horizontal overflow ── */}
                  <span style={{
                    fontSize: 12.5,
                    lineHeight: '20px',
                    whiteSpace: 'pre-wrap',   // was 'pre' — this is the main fix
                    wordBreak: 'break-all',   // break very long tokens too
                    color: '#d4d4d4',
                    flex: 1,
                    minWidth: 0,
                  }}>
                    {colorize(line || ' ')}
                  </span>
                  {isStreaming && i === lines.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                      style={{ display: 'inline-block', width: 2, height: 14, background: '#D4FF57', borderRadius: 1, verticalAlign: 'middle', marginLeft: 1, alignSelf: 'center' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* bottom action bar */}
      <div style={{
        position: 'relative', zIndex: 2, flexShrink: 0,
        borderTop: '1px solid var(--brand-border)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--brand-dark)',
      }}>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(240,237,230,0.65)' }}>
          {isStreaming ? 'Streaming live...' : isDone ? 'Generation complete' : 'Ready'}
        </span>

        <AnimatePresence>
          {isDone && (
            <motion.button
              initial={{ opacity: 0, x: 16, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPreview}
              className="hover-glow"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase',
                color: '#080808', background: '#D4FF57',
                border: 'none', padding: '11px 28px',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <Eye size={13} />
              Open Preview
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(212, 255, 87, 0.45);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}