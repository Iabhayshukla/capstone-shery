import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trash2, RefreshCw, RotateCcw, Sparkles, CornerDownLeft, MessageSquare } from 'lucide-react';

const SAMPLE_PROMPTS = [
  'Coffee shop landing page',
  'SaaS pricing page',
  'Portfolio site',
  'Restaurant landing page',
];

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isReady: boolean;
  lastPrompt?: string;
  onRegenerate?: () => void;
  selectedSection?: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function PromptPanel({
  onGenerate,
  isGenerating,
  isReady,
  lastPrompt,
  onRegenerate,
  selectedSection,
  messages,
  setMessages,
}: PromptPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect mobile screen for safe spacing
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isGenerating || !isReady) return;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: selectedSection ? `[${selectedSection}] ${input.trim()}` : input.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    onGenerate(selectedSection ? `Edit only the "${selectedSection}" section: ${input.trim()}` : input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const isDisabled = !input.trim() || isGenerating || !isReady;

  return (
    <div className="h-full bg-[var(--surface)] font-[DM Sans] flex flex-col w-full">
      {/* HEADER */}
      <div className="relative px-3 sm:px-4 py-2 sm:py-3 border-b border-[var(--border)] flex items-center justify-between flex-shrink-0 bg-black/15">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--brand-primary)] inline-block"
            style={{ boxShadow: `0 0 8px var(--brand-primary)`, animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <span className="font-[Bebas Neue] text-sm sm:text-base tracking-widest text-[var(--text-primary)]">
            CAPSTONE<span className="text-[var(--brand-primary)]">.</span>SHERY
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <AnimatePresence>
            {lastPrompt && !isGenerating && onRegenerate && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegenerate}
                title={`Regenerate: "${lastPrompt.slice(0, 50)}..."`}
                className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] tracking-wider uppercase text-[var(--text-muted)] bg-transparent border border-[var(--border)] rounded-md px-2 sm:px-2.5 py-1 sm:py-1.5 cursor-pointer transition-all duration-200 hover:text-[var(--brand-primary)] hover:border-[rgba(var(--brand-primary-rgb),0.4)]"
              >
                <RefreshCw size={9} className="sm:w-[10px] sm:h-[10px]" />
                <span>Redo</span>
              </motion.button>
            )}
          </AnimatePresence>

          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              title="Clear conversation"
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-transparent border border-[var(--border)] rounded-md text-[var(--text-muted)] cursor-pointer transition-all duration-200 hover:text-red-400 hover:border-red-500/40"
            >
              <Trash2 size={11} className="sm:w-[12px] sm:h-[12px]" />
            </motion.button>
          )}
        </div>

        {/* subtle glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-30" />
      </div>

      {/* SELECTED SECTION BADGE */}
      <AnimatePresence mode="wait">
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="px-3 sm:px-4 pt-2 pb-1.5 border-b border-[var(--border)] flex-shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 py-1.5 px-2 bg-[rgba(var(--brand-primary-rgb),0.06)] border-l-2 border-[var(--brand-primary)] rounded-r-md">
              <Sparkles size={11} className="sm:w-[12px] sm:h-[12px] text-[var(--brand-primary)] flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-[var(--brand-primary)] font-medium truncate">
                Editing: {selectedSection}
              </span>
              <span className="ml-auto text-[8px] sm:text-[9px] text-[var(--text-muted)] flex-shrink-0">active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESSAGES AREA – added top padding on mobile to clear the close button */}
      <div
        className={`flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4 ${
          isMobile ? 'pt-12' : ''
        }`}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full text-center gap-2 sm:gap-3 px-2"
          >
            <div
              className="font-[Bebas Neue] leading-[1.05] tracking-[1] text-[var(--text-primary)] text-center"
              style={{ fontSize: 'clamp(28px, 6vw, 52px)' }}
            >
              {selectedSection ? (
                <>
                  Edit<br /><span className="text-[var(--brand-primary)]">{selectedSection}</span>
                </>
              ) : (
                <>
                  What to<br /><span className="text-[var(--brand-primary)]">build?</span>
                </>
              )}
            </div>

            <p className="text-[11px] sm:text-[12px] font-light tracking-[0.2] text-[var(--text-muted)] max-w-[220px] sm:max-w-[240px] leading-relaxed px-2">
              {selectedSection
                ? 'Describe what to change in this section.'
                : 'Describe your website — AI builds it instantly.'}
            </p>

            {!isReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 w-full max-w-[220px] sm:max-w-[240px] p-2 sm:p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-md flex items-center gap-2 text-[9px] sm:text-[10px] tracking-wider uppercase text-amber-400"
              >
                <RotateCcw size={11} className="sm:w-[12px] sm:h-[12px] animate-spin flex-shrink-0" />
                <span className="truncate">Preview loading...</span>
              </motion.div>
            )}

            {!selectedSection && (
              <div className="w-full mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-2">
                <div className="text-[8px] sm:text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] opacity-40 mb-1 flex items-center gap-2 justify-center">
                  <span className="w-3 h-px sm:w-4 bg-[var(--border)]" />
                  Try these
                  <span className="w-3 h-px sm:w-4 bg-[var(--border)]" />
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {SAMPLE_PROMPTS.map((p, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300 }}
                      whileHover={{ x: 4, borderColor: 'rgba(var(--brand-primary-rgb), 0.5)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(p)}
                      className="group w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 bg-transparent border border-[var(--border)] rounded-md text-[var(--text-muted)] cursor-pointer transition-all duration-200 font-[DM Sans] font-light text-[11px] sm:text-[12px] tracking-[0.2] flex items-center justify-between hover:bg-[rgba(var(--brand-primary-rgb),0.04)] hover:text-[var(--text-primary)] min-h-[36px] sm:min-h-[40px]"
                    >
                      <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <MessageSquare size={10} className="sm:w-[11px] sm:h-[11px] opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <span className="truncate">{p}</span>
                      </span>
                      <ArrowRight size={11} className="sm:w-[12px] sm:h-[12px] opacity-0 group-hover:opacity-70 transition-all group-hover:translate-x-1 flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex gap-2 sm:gap-3 items-start px-1"
              style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 rounded-full border flex items-center justify-center text-[8px] sm:text-[9px] font-bold tracking-[0.3] mt-0.5 shadow-sm transition-all"
                style={{
                  background: msg.role === 'user'
                    ? 'rgba(var(--brand-primary-rgb), 0.15)'
                    : `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`,
                  border: `1px solid ${msg.role === 'user' ? 'rgba(var(--brand-primary-rgb), 0.3)' : 'transparent'}`,
                  color: msg.role === 'user' ? 'var(--brand-primary)' : 'white',
                }}
              >
                {msg.role === 'user' ? 'U' : '✨'}
              </div>

              <div
                className="max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 text-[11.5px] sm:text-[12.5px] font-light leading-relaxed rounded-2xl shadow-sm break-words"
                style={{
                  background: msg.role === 'user'
                    ? 'rgba(var(--brand-primary-rgb), 0.08)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(var(--brand-primary-rgb), 0.15)' : 'var(--border)'}`,
                  color: msg.role === 'user' ? 'var(--text-primary)' : 'rgba(240,237,230,0.85)',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 sm:gap-3 items-start px-1"
          >
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`, boxShadow: `0 0 8px rgba(var(--brand-primary-rgb), 0.4)` }}
            >
              ✨
            </div>
            <div className="p-2.5 sm:p-3 bg-white/3 border border-[var(--border)] rounded-2xl rounded-bl-4px flex items-center gap-1.5 sm:gap-2">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--brand-primary)] inline-block"
                />
              ))}
              <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] ml-0.5 sm:ml-1 uppercase tracking-wider">AI thinking</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-2 sm:p-3 border-t border-[var(--border)] flex-shrink-0 bg-black/15">
        <div
          className="relative rounded-md transition-all duration-200 bg-white/2 focus-within:shadow-[0_0_0_2px_rgba(var(--brand-primary-rgb),0.1)]"
          style={{
            border: `1px solid ${input.trim() ? 'rgba(var(--brand-primary-rgb), 0.4)' : 'var(--border)'}`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedSection ? `Edit "${selectedSection}"...` : 'Describe your website...'}
            rows={1}
            disabled={isGenerating || !isReady}
            className="w-full bg-transparent resize-none outline-none border-none px-2 sm:px-3 py-2 sm:py-2.5 pr-8 sm:pr-10 text-[12px] sm:text-[13px] font-light leading-relaxed text-[var(--text-primary)] font-[DM Sans] tracking-[0.2] placeholder:text-[11px] sm:placeholder:text-[12px]"
          />
          <motion.button
            onClick={handleSubmit}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              background: isDisabled ? 'transparent' : 'var(--brand-primary)',
              border: isDisabled ? '1px solid var(--border)' : 'none',
              color: isDisabled ? 'rgba(255,255,255,0.2)' : '#080808',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating
              ? <RotateCcw size={11} className="sm:w-[12px] sm:h-[12px] animate-spin" />
              : <ArrowRight size={11} className="sm:w-[12px] sm:h-[12px]" />
            }
          </motion.button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-0.5 sm:px-1">
          <p className="text-[8px] sm:text-[9px] tracking-[1.5px] uppercase text-[var(--text-muted)] opacity-30">
            Enter to send · Shift+Enter new line
          </p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <CornerDownLeft size={7} className="sm:w-[8px] sm:h-[8px] text-[var(--text-muted)] opacity-40" />
            <span className="text-[8px] sm:text-[9px] text-[var(--text-muted)] opacity-40">AI ready</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        
        @keyframes pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        textarea::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.45;
        }
        
        textarea:disabled {
          opacity: 0.5;
        }
        
        ::-webkit-scrollbar {
          width: 3px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--brand-primary);
        }
        
        /* Hide scrollbar on mobile for cleaner look */
        @media (max-width: 640px) {
          ::-webkit-scrollbar {
            width: 2px;
          }
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button, 
          [role="button"],
          .cursor-pointer {
            min-height: 36px;
          }
        }
      `}</style>
    </div>
  );
}