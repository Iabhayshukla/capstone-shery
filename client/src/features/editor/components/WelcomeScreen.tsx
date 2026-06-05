import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Globe, Palette, Code2 } from 'lucide-react';

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

const FEATURES = [
  { icon: Zap, label: 'AI Powered', desc: 'Generate in seconds' },
  { icon: Globe, label: 'Live Preview', desc: 'See it instantly' },
  { icon: Palette, label: 'Tailwind CSS', desc: 'Beautiful by default' },
  { icon: Code2, label: 'Clean Code', desc: 'HTML + CSS + JS' },
];

export default function WelcomeScreen({ onGenerate, isGenerating }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden"
      style={{ background: 'var(--brand-dark)' }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-orb-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb-2 absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)' }}
        />
        <div className="bg-dot-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center gap-10">

        {/* Logo + Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center glow-sm"
            style={{ background: 'var(--brand-primary-light)', border: '1px solid rgba(108,99,255,0.3)' }}
          >
            <Sparkles size={28} style={{ color: 'var(--brand-primary)' }} />
          </div>

          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              What do you want to build?
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              Describe your website and AI will generate it instantly.
            </p>
          </div>
        </motion.div>

        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full"
        >
          <div
            className="relative rounded-2xl transition-all duration-300"
            style={{
              background: 'var(--brand-glass)',
              border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--brand-border)'}`,
              boxShadow: focused ? '0 0 0 3px var(--brand-primary-light), var(--shadow-lg)' : 'var(--shadow-md)',
              backdropFilter: 'blur(16px)',
            }}
          >
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
              className="w-full bg-transparent resize-none outline-none px-5 pt-5 pb-16 text-base leading-relaxed disabled:opacity-50"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            />

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                Enter to generate · Shift+Enter for new line
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  boxShadow: prompt.trim() ? 'var(--shadow-glow-sm)' : 'none',
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sample Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full flex flex-col gap-3"
        >
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Try these
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SAMPLE_PROMPTS.map((p, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPrompt(p)}
                className="px-3.5 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: 'var(--brand-glass)',
                  border: '1px solid var(--brand-border)',
                  color: 'var(--text-muted)',
                }}
              >
                {p}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: 'var(--brand-glass)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <Icon size={13} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>· {desc}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
}