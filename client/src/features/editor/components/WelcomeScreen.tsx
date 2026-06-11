import { useState, useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';

interface WelcomeScreenProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  'Coffee shop landing page with warm tones',
  'SaaS pricing page with 3 tiers',
  'Portfolio site for a photographer',
  'Restaurant landing page with menu',
  'Agency website with hero section',
];

const TICKER_ITEMS = [
  'React', 'Tailwind CSS', 'Claude AI', 'SSE Streaming',
  'TypeScript', 'One-Click Export', 'Live Preview', 'Supabase',
  'React', 'Tailwind CSS', 'Claude AI', 'SSE Streaming',
  'TypeScript', 'One-Click Export', 'Live Preview', 'Supabase',
];

export default function WelcomeScreen({ onGenerate, isGenerating }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setTimeout(() => setParticles([]), 800);
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    const btn = document.querySelector('.generate-btn') as HTMLElement;
    if (btn) emitParticles(btn.getBoundingClientRect());
    onGenerate(prompt.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--brand-dark)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* grid bg */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* aurora blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 700, height: 400,
          background: 'linear-gradient(135deg, #6C63FF 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(90px)',
          top: -120, left: -200, opacity: 0.1,
          animation: 'aFloat1 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          background: 'linear-gradient(225deg, #ff6584 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(90px)',
          bottom: -50, right: -100, opacity: 0.08,
          animation: 'aFloat2 26s ease-in-out infinite',
        }} />
      </div>

      {/* ticker */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '10px 0', overflow: 'hidden',
        background: 'rgba(212,255,87,0.02)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', animation: 'tickScroll 22s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '0 28px', fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase', color: 'rgba(240,237,230,0.6)',
            }}>
              {item}
              <span style={{ color: '#D4FF57', opacity: 0.5, fontSize: 14 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <Link
        to="/dashboard"
        style={{
          position: 'absolute',
          top: 60,
          left: 24,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'rgba(240, 237, 230, 0.65)',
          textDecoration: 'none',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '8px 16px',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212, 255, 87, 0.3)';
          (e.currentTarget as HTMLAnchorElement).style.color = '#D4FF57';
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212, 255, 87, 0.02)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(240, 237, 230, 0.65)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.03)';
        }}
      >
        <ArrowLeft size={13} />
        Back to Dashboard
      </Link>

      {/* main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 24px 40px', position: 'relative', zIndex: 2,
        gap: 0,
        transform: 'translateY(-12px)',
      }}>

        {/* logo badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            color: 'rgba(240,237,230,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '7px 16px', marginBottom: 20,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#D4FF57', animation: 'blink 1.4s step-end infinite',
            display: 'inline-block',
          }} />
          Capstone-Shery AI — Generator
        </motion.div>

        {/* heading */}
        <div style={{ textAlign: 'center', marginBottom: 28, lineHeight: 0.92 }}>
          {['What do you', 'want to build?'].map((line, li) => (
            <motion.div
              key={li}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + li * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: 'hidden', display: 'block',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(52px, 8vw, 96px)',
                letterSpacing: 1,
                color: li === 1 ? '#D4FF57' : '#f0ede6',
                lineHeight: 1,
              }}
            >
              {line}
            </motion.div>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: 16,
              fontSize: 14, fontWeight: 300, letterSpacing: 0.3,
              color: 'rgba(240,237,230,0.65)', lineHeight: 1.7,
            }}
          >
            Describe your website and AI will generate it instantly.
          </motion.p>
        </div>

        {/* input box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ width: '100%', maxWidth: 680, marginBottom: 16 }}
        >
          <div style={{
            position: 'relative',
            border: `1px solid ${focused ? 'rgba(212,255,87,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(212,255,87,0.08)' : 'none',
          }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. A modern coffee shop landing page with warm tones, menu section, and contact form..."
              rows={3}
              disabled={isGenerating}
              style={{
                width: '100%', background: 'transparent', resize: 'none',
                outline: 'none', border: 'none',
                padding: '20px 20px 60px',
                fontSize: 14, lineHeight: 1.7, fontWeight: 300,
                color: '#f0ede6', fontFamily: 'DM Sans, sans-serif',
                letterSpacing: 0.2,
              }}
            />

            {/* bottom bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '10px 14px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(240,237,230,0.6)' }}>
                Enter to generate · Shift+Enter new line
                {charCount > 0 && ` · ${charCount} chars`}
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="generate-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 11, fontWeight: 500, letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: !prompt.trim() || isGenerating ? 'rgba(8,8,8,0.5)' : '#080808',
                  background: !prompt.trim() || isGenerating ? 'rgba(212,255,87,0.4)' : '#D4FF57',
                  border: 'none', padding: '9px 20px',
                  cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      border: '2px solid rgba(8,8,8,0.3)', borderTopColor: '#080808',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Generate
                    <ArrowRight size={12} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* sample prompts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 680 }}
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
                fontSize: 11, fontWeight: 300, letterSpacing: 0.5,
                color: 'rgba(240,237,230,0.65)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '7px 14px', cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,255,87,0.3)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,237,230,0.85)';
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,237,230,0.65)';
              }}
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* bottom stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, flexShrink: 0,
        }}
      >
        {[
          { n: '12,847', l: 'Sites Generated' },
          { n: '~8s',    l: 'Avg Build Time' },
          { n: '100%',   l: 'Clean Code' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', gap: 2,
            padding: '14px 40px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24, letterSpacing: 1, color: '#f0ede6', lineHeight: 1,
            }}>{s.n}</span>
            <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(240,237,230,0.6)' }}>
              {s.l}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Particles portal */}
      {particles.map(p => (
        createPortal(
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 0.5, x: p.x, y: p.y }}
            animate={{ opacity: 0, y: p.y - 100, x: p.x + (Math.random() - 0.5) * 80 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: 5,
              height: 5,
              background: '#D4FF57',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 0 6px #D4FF57',
            }}
          />,
          document.body
        )
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes aFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,40px) scale(1.08)} }
        @keyframes aFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,-60px) scale(1.1)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes tickScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        textarea::placeholder { color: rgba(240,237,230,0.5) !important; }
        textarea:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
}