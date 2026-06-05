import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye } from 'lucide-react';

interface StreamingFile {
  name: string;
  content: string;
  language: 'html' | 'css' | 'js' | 'jsx' | 'tsx';
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

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const prevText = useRef('');

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default function StreamingView({ files, isStreaming, onPreview, error }: StreamingViewProps) {
  const [copied, setCopied] = useState(false);
  const codeBodyRef = useRef<HTMLDivElement>(null);
  const activeFile = files[0];
  const lines = activeFile?.content.split('\n') ?? [];

  const progress = lines.length > 0 ? Math.min(lines.length / 40, 1) : 0;
  const msgIdx = Math.min(Math.floor(progress * AI_MESSAGES.length), AI_MESSAGES.length - 1);
  const currentAiMsg = isStreaming
    ? AI_MESSAGES[msgIdx]
    : error
    ? 'Generation failed. See the error below.'
    : lines.length > 0
    ? '✦ Your website is ready! Click Open Preview to see it live.'
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

  const isDone = !isStreaming && lines.length > 0 && !error;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'var(--brand-dark)',
        overflow: 'hidden',
      }}
    >
      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 0 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', padding: '8px 28px' }}>

          {/* Avatar */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-primary), #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            S
          </div>

          {/* Message Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Name */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-faint)',
                marginBottom: '8px',
                letterSpacing: '0.01em',
              }}
            >
              Shery
            </div>

            {/* AI Text */}
            <div
              style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: '1.75',
                marginBottom: lines.length > 0 ? '16px' : '0',
                minHeight: '24px',
              }}
            >
              {displayedMsg}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.75 }}
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '16px',
                    background: 'var(--brand-primary)',
                    borderRadius: '1px',
                    verticalAlign: 'text-bottom',
                    marginLeft: '2px',
                  }}
                />
              )}
            </div>

            {/* Error Banner */}
            {error && !isStreaming && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '4px' }}>Generation failed</strong>
                {error}
              </div>
            )}

            {/* Code Block */}
            <AnimatePresence>
              {lines.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--brand-border)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace',
                  }}
                >
                  {/* Code Header */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--brand-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e34c26' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                        {activeFile?.name ?? 'index.html'}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: copied ? '#22c55e' : 'var(--text-faint)',
                        background: 'transparent',
                        border: '1px solid var(--brand-border)',
                        borderRadius: '5px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Code Body */}
                  <div
                    ref={codeBodyRef}
                    style={{
                      padding: '14px 16px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      overflowX: 'auto',
                    }}
                  >
                    {lines.map((line, i) => (
                      <div key={i} style={{ display: 'flex', minHeight: '20px' }}>
                        <span
                          style={{
                            minWidth: '32px',
                            paddingRight: '16px',
                            textAlign: 'right',
                            color: 'rgba(255,255,255,0.12)',
                            fontSize: '12px',
                            lineHeight: '20px',
                            userSelect: 'none',
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '12.5px',
                            lineHeight: '20px',
                            color: '#d4d4d4',
                            whiteSpace: 'pre',
                          }}
                        >
                          {line || ' '}
                        </span>
                        {isStreaming && i === lines.length - 1 && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.75 }}
                            style={{
                              display: 'inline-block',
                              width: '2px',
                              height: '14px',
                              background: 'var(--brand-primary)',
                              borderRadius: '1px',
                              verticalAlign: 'middle',
                              marginLeft: '1px',
                              alignSelf: 'center',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid var(--brand-border)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={isDone ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 500,
            background: isDone ? 'rgba(34,197,94,0.1)' : 'rgba(108,99,255,0.12)',
            border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : 'rgba(108,99,255,0.25)'}`,
            color: isDone ? '#22c55e' : 'var(--brand-primary)',
          }}
        >
          <motion.div
            animate={isStreaming ? { scale: [1, 1.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: isDone ? '#22c55e' : 'var(--brand-primary)',
            }}
          />
          {isDone ? 'Done' : 'Generating...'}
        </motion.div>

        <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
          {activeFile?.name ?? 'index.html'}
          {lines.length > 0 && ` · ${lines.length} lines`}
        </span>

        <AnimatePresence>
          {isDone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPreview}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 18px',
                borderRadius: '8px',
                background: 'var(--brand-primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                boxShadow: 'var(--shadow-glow-sm)',
              }}
            >
              <Eye size={15} />
              Open Preview
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}