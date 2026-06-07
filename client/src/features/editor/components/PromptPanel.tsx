import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trash2, RefreshCw, RotateCcw } from 'lucide-react';

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
    <div className="h-full bg-[var(--brand-surface)] font-[DM Sans] flex flex-col">
      {/* HEADER */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-black/15">
        {/* <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#D4FF57] inline-block shadow-[0_0_6px_#D4FF57]"
            style={{ animation: 'blink 1.4s step-end infinite' }}
          />
          <span className="font-[Bebas Neue] text-sm tracking-widest text-[#f0ede6]">
            CAPSTONE<span className="text-[#D4FF57]">.</span>SHERY
          </span>
        </div> */}

        <div className="flex items-center gap-1.5">
          <AnimatePresence>
            {lastPrompt && !isGenerating && onRegenerate && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onRegenerate}
                title={`Regenerate: "${lastPrompt}"`}
                className="flex items-center gap-1 text-xs tracking-wider uppercase text-white/50 bg-transparent border border-white/7 px-2.5 py-1 cursor-pointer transition-all duration-200 hover:text-white/70 hover:border-white/15"
                style={{ fontSize: 10, letterSpacing: 1.5 }}
              >
                <RefreshCw size={10} />
                Redo
              </motion.button>
            )}
          </AnimatePresence>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear conversation"
              className="flex items-center justify-center w-6.5 h-6.5 bg-transparent border border-white/7 text-white/35 cursor-pointer transition-all duration-200 hover:text-red-500 hover:border-red-500/30"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* SELECTED SECTION BADGE */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2 border-b border-white/5 flex-shrink-0"
          >
            <div
              className="flex items-center gap-2 p-1.5 bg-[#D4FF57]/6 border-[#D4FF57]/15 text-xs tracking-wider uppercase text-[#D4FF57]"
              style={{ fontSize: 10, letterSpacing: 1.5 }}
            >
              <span className="w-1 h-1 rounded-full bg-[#D4FF57] inline-block" />
              Editing: {selectedSection}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-0"
          >
            <div
              className="font-[Bebas Neue] leading-[0.95] tracking-[1] text-[#f0ede6] mb-3"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              {selectedSection ? (
                <>
                  Edit<br /><span className="text-[#D4FF57]">{selectedSection}</span>
                </>
              ) : (
                <>
                  What to<br /><span className="text-[#D4FF57]">build?</span>
                </>
              )}
            </div>

            <p
              className="text-[11px] font-light tracking-[0.3] text-white/35 max-w-[200px] leading-[1.7] mb-6"
            >
              {selectedSection
                ? 'Describe what to change in this section.'
                : 'Describe your website — AI builds it instantly.'}
            </p>

            {!isReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full mb-4 p-2 bg-yellow-500/8 border-yellow-500/20 flex items-center gap-2 text-xs tracking-wider uppercase text-yellow-500"
                style={{ fontSize: 10, letterSpacing: 1 }}
              >
                <RotateCcw
                  size={10}
                  className="inline-block"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                Preview loading...
              </motion.div>
            )}

            {!selectedSection && (
              <div className="w-full flex flex-col gap-1.5">
                <div className="text-[9px] tracking-[2] uppercase text-white/25 mb-1">
                  Try these
                </div>
                {SAMPLE_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    onClick={() => setInput(p)}
                    className="w-full text-left p-2 bg-transparent border border-white/6 text-white/45 cursor-pointer transition-all duration-200 font-[DM Sans] font-light text-[12px] tracking-[0.3] hover:border-[#D4FF57]/25 hover:text-white/80 hover:bg-[#D4FF57]/3 flex items-center justify-between"
                  >
                    <span>{p}</span>
                    <ArrowRight size={11} className="opacity-40 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 items-start flex-shrink-0"
              style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              <div
                className="w-6.5 h-6.5 flex-shrink-0 rounded-full border flex items-center justify-center text-[9px] font-bold text-white tracking-[0.5] mt-0.5"
                style={{
                  background: msg.role === 'user'
                    ? 'rgba(108,99,255,0.2)'
                    : 'linear-gradient(135deg, #6C63FF, #ff6584)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(108,99,255,0.3)' : 'transparent'}`,
                }}
              >
                {msg.role === 'user' ? 'U' : 'CS'}
              </div>

              <div
                className="max-w-[78%] p-2.5 text-[12.5px] font-light leading-[1.65] rounded-[12px_12px_2px_12px]"
                style={{
                  background: msg.role === 'user'
                    ? 'rgba(108,99,255,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  color: msg.role === 'user' ? '#f0ede6' : 'rgba(240,237,230,0.8)',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
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
            className="flex gap-2.5 items-start"
          >
            <div
              className="w-6.5 h-6.5 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #6C63FF, #ff6584)',
              }}
            >
              CS
            </div>
            <div
              className="p-2.5 bg-white/3 border-white/6 rounded-[12px_12px_12px_2px] flex items-center gap-1.25"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.25 h-1.25 rounded-full bg-[#D4FF57] opacity-70 inline-block"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t border-white/5 flex-shrink-0 bg-black/15">
        <div
          className="relative border transition-colors duration-200 bg-white/2"
          style={{
            border: `1px solid ${input.trim() ? 'rgba(212,255,87,0.35)' : 'rgba(255,255,255,0.07)'}`,
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
            className="w-full bg-transparent resize-none outline-none border-none padding-[10px_42px_10px_12px] text-[13px] font-light leading-[1.6] text-[#f0ede6] font-[DM Sans] tracking-[0.2]"
          />
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center transition-all duration-200"
            style={{
              background: isDisabled ? 'transparent' : '#D4FF57',
              border: isDisabled ? '1px solid rgba(255,255,255,0.08)' : 'none',
              color: isDisabled ? 'rgba(255,255,255,0.2)' : '#080808',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating
              ? <RotateCcw size={12} className="inline-block" style={{ animation: 'spin 1s linear infinite' }} />
              : <ArrowRight size={12} />
            }
          </button>
        </div>
        <p className="text-[9px] tracking-[1.5] uppercase text-white/2 mt-1.5 text-center">
          Enter to send · Shift+Enter new line
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes spin { to{transform:rotate(360deg)} }
        textarea::placeholder { color: rgba(240,237,230,0.2) !important; }
        textarea:disabled { opacity: 0.4; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
    </div>
  );
}