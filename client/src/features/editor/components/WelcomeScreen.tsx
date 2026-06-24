import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';

interface WelcomeScreenProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  'Landing page for an AI startup',
  'E-commerce dashboard with analytics',
  'Personal blog with dark theme',
  'Portfolio site for a photographer',
  'SaaS pricing page with interactive calculator',
];

const TICKER_ITEMS = [
  'Next.js 14',
  'Tailwind CSS',
  'GPT-4o',
  'Streaming',
  'TypeScript',
  'Framer Motion',
  'Radix UI',
  'Vercel',
  'Next.js 14',
  'Tailwind CSS',
  'GPT-4o',
  'Streaming',
  'TypeScript',
  'Framer Motion',
  'Radix UI',
  'Vercel',
];

export default function WelcomeScreen({ onGenerate, isGenerating }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generateBtnRef = useRef<HTMLButtonElement>(null);
  const particleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (particleTimeoutRef.current) clearTimeout(particleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
    setCharCount(prompt.length);
  }, [prompt]);

  const emitParticles = (buttonRect: DOMRect) => {
    const newParticles = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: buttonRect.left + buttonRect.width / 2 + (Math.random() - 0.5) * 50,
      y: buttonRect.top + buttonRect.height / 2,
    }));
    setParticles(newParticles);
    if (particleTimeoutRef.current) clearTimeout(particleTimeoutRef.current);
    particleTimeoutRef.current = setTimeout(() => setParticles([]), 800);
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    const btn = generateBtnRef.current;
    if (btn) emitParticles(btn.getBoundingClientRect());
    onGenerate(prompt.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* New simplified background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            linear-gradient(
              180deg,
              #5450D9 0%,
              #2A286B 28%,
              #070716 60%,
              #000000 100%
            )
          `,
        }}
      >
        {/* Soft radial glow at the top */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(
                ellipse at top center,
                rgba(99,102,241,0.28) 0%,
                rgba(99,102,241,0.12) 35%,
                transparent 70%
              )
            `,
          }}
        />
      </div>

      {/* Ticker */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          borderBottom: '1px solid var(--border)',
          padding: `${isMobile ? '6px' : '8px'} 0`,
          overflow: 'hidden',
          background: 'rgba(var(--brand-primary-rgb, 108,99,255), 0.01)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            animation: 'tickScroll 24s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isMobile ? 4 : 8,
                padding: `0 ${isMobile ? 14 : 24}px`,
                fontSize: isMobile ? 7 : 9,
                letterSpacing: isMobile ? 1 : 2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {item}
              <span style={{ color: 'var(--brand-primary)', opacity: 0.6, fontSize: isMobile ? 9 : 12 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Back link */}
      <Link
        to="/dashboard"
        style={{
          position: 'absolute',
          top: isMobile ? 14 : 50,
          left: isMobile ? 10 : 20,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 4 : 6,
          fontSize: isMobile ? 8 : 10,
          fontWeight: 500,
          letterSpacing: isMobile ? 1 : 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: `${isMobile ? '5px' : '7px'} ${isMobile ? '10px' : '14px'}`,
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--brand-primary)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--brand-primary)';
          (e.currentTarget as HTMLAnchorElement).style.background =
            'rgba(var(--brand-primary-rgb, 108,99,255), 0.02)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)';
        }}
      >
        <ArrowLeft size={isMobile ? 9 : 12} />
        <span>{isSmallMobile ? 'Back' : 'Back to Dashboard'}</span>
      </Link>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${isMobile ? '12px' : '20px'} ${isMobile ? '12px' : '20px'} ${isMobile ? '20px' : '36px'}`,
          position: 'relative',
          zIndex: 2,
          transform: `translateY(${isMobile ? '-6px' : '-14px'})`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
            fontSize: isMobile ? 7 : 10,
            letterSpacing: isMobile ? 1 : 2,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: `${isMobile ? '4px' : '6px'} ${isMobile ? '10px' : '14px'}`,
            marginBottom: isMobile ? 10 : 18,
          }}
        >
          <span
            style={{
              width: isMobile ? 4 : 5,
              height: isMobile ? 4 : 5,
              borderRadius: '50%',
              background: 'var(--brand-primary)',
              animation: 'blink 1.4s step-end infinite',
              display: 'inline-block',
            }}
          />
          <span>{isSmallMobile ? 'Shery AI' : 'Capstone · Shery AI — AI‑Powered Web Builder'}</span>
        </motion.div>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? 14 : 24, lineHeight: 0.92 }}>
          {['From Prompt to Production', 'Sites That Ship Themselves'].map((line, li) => (
            <motion.div
              key={li}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + li * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: 'hidden',
                display: 'block',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isMobile
                  ? li === 1
                    ? '44px'
                    : '38px'
                  : `clamp(48px, 7vw, ${li === 1 ? '88px' : '76px'})`,
                letterSpacing: isMobile ? 0 : 1,
                color: li === 1 ? 'var(--brand-primary)' : 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {line}
            </motion.div>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: isMobile ? 10 : 14,
              fontSize: isMobile ? 10 : 13,
              fontWeight: 300,
              letterSpacing: 0.3,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              padding: `0 ${isMobile ? 14 : 0}px`,
            }}
          >
            Describe your vision and Shery will craft a stunning, production‑ready site in seconds.
          </motion.p>
        </div>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            width: '100%',
            maxWidth: isMobile ? '90vw' : 680,
            marginBottom: isMobile ? 10 : 16,
          }}
        >
          <div
            style={{
              position: 'relative',
              border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border)'}`,
              background: 'var(--surface)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: focused
                ? '0 0 0 3px rgba(var(--brand-primary-rgb, 108,99,255), 0.08)'
                : 'none',
            }}
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. A sleek crypto dashboard with live charts, wallet connect, and dark mode…"
              rows={3}
              disabled={isGenerating}
              style={{
                width: '100%',
                background: 'transparent',
                resize: 'none',
                outline: 'none',
                border: 'none',
                padding: `${isMobile ? '10px' : '18px'} ${isMobile ? '10px' : '18px'} ${
                  isMobile ? '36px' : '56px'
                }`,
                fontSize: isMobile ? 11 : 13,
                lineHeight: 1.6,
                fontWeight: 300,
                color: 'var(--text-primary)',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: 0.2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: `${isMobile ? '5px' : '8px'} ${isMobile ? '8px' : '12px'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.15)',
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? 7 : 9,
                  letterSpacing: isMobile ? 1 : 1.5,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                ⏎ Generate · ⇧+⏎ new line
                {charCount > 0 && ` · ${charCount} chars`}
              </span>
              <motion.button
                ref={generateBtnRef}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="generate-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 4 : 8,
                  fontSize: isMobile ? 8 : 10,
                  fontWeight: 500,
                  letterSpacing: isMobile ? 1 : 2,
                  textTransform: 'uppercase',
                  color: !prompt.trim() || isGenerating ? 'rgba(255,255,255,0.5)' : '#ffffff',
                  background:
                    !prompt.trim() || isGenerating
                      ? 'rgba(var(--brand-primary-rgb, 108,99,255), 0.4)'
                      : 'var(--brand-primary)',
                  border: 'none',
                  padding: `${isMobile ? '5px' : '8px'} ${isMobile ? '12px' : '18px'}`,
                  cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {isGenerating ? (
                  <>
                    <div
                      style={{
                        width: isMobile ? 9 : 11,
                        height: isMobile ? 9 : 11,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span>{isSmallMobile ? 'Gen...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={isMobile ? 9 : 11} />
                    <span>{isSmallMobile ? 'Gen' : 'Generate'}</span>
                    <ArrowRight size={isMobile ? 9 : 11} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sample prompts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 5 : 8,
            justifyContent: 'center',
            maxWidth: isMobile ? '90vw' : 680,
            padding: `0 ${isMobile ? 6 : 0}px`,
          }}
        >
          {SAMPLE_PROMPTS.map((p, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.06 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPrompt(p)}
              style={{
                fontSize: isMobile ? 8 : 10,
                fontWeight: 300,
                letterSpacing: 0.5,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: `${isMobile ? '4px' : '6px'} ${isMobile ? '10px' : '12px'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                textAlign: 'center',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Particle burst */}
      {particles.map((p) =>
        createPortal(
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 0.5, x: p.x, y: p.y }}
            animate={{ opacity: 0, y: p.y - 100, x: p.x + (Math.random() - 0.5) * 80 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: 4,
              height: 4,
              background: 'var(--brand-primary)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 0 6px var(--brand-primary)',
            }}
          />,
          document.body
        )
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes tickScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        textarea::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.5;
        }
        textarea:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}