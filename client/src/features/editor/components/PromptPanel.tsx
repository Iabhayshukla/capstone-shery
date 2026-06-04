import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, Trash2, RotateCcw, Lightbulb } from "lucide-react";

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;  // tera logic
  isGenerating: boolean;                  // tera logic
  isReady: boolean;                       // tera logic
}

const SAMPLE_PROMPTS = [
  'Coffee shop landing page',
  'SaaS pricing page',
  'Portfolio site',
  'Restaurant landing page',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PromptPanel({ onGenerate, isGenerating, isReady }: PromptPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Tera logic — real API call
  const handleSubmit = () => {
    if (!input.trim() || isGenerating || !isReady) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    onGenerate(input.trim()); // tera real API call
    setInput('');
  };

  // Jab generating complete ho — AI message add karo
  useEffect(() => {
    if (!isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'user') {
      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Website generated! Check the preview on the right. Click any section to select and edit it. Use the Code button to view HTML.",
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  }, [isGenerating]);

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
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--brand-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-primary/20 flex items-center justify-center">
            <Sparkles size={14} className="text-brand-primary" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            AI Prompt
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)] transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Welcome State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-brand-primary" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-secondary)] mb-1">
              What would you like to build?
            </h3>
            <p className="text-xs text-[var(--text-faint)] max-w-[260px] mb-6">
              Describe your website and AI will generate it instantly.
            </p>

            {/* Not ready warning */}
            {!isReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2"
              >
                <RotateCcw size={12} className="animate-spin" />
                Preview loading... please wait
              </motion.div>
            )}

            {/* Quick prompts */}
            <div className="w-full space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] mb-2">
                <Lightbulb size={12} />
                <span>Try these</span>
              </div>
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-[var(--brand-glass)] hover:bg-[var(--brand-glass-hover)] border border-[var(--brand-border)] hover:border-[var(--brand-border-hover)] transition-all"
                >
                  "{prompt}"
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-brand-primary/20' : 'bg-emerald-500/20'}`}>
                {msg.role === 'user' ? (
                  <User size={13} className="text-brand-primary" />
                ) : (
                  <Bot size={13} className="text-emerald-400" />
                )}
              </div>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-primary/15 text-[var(--text-primary)] rounded-tr-sm'
                  : 'bg-[var(--brand-glass)] text-[var(--text-secondary)] border border-[var(--brand-border)] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Bot size={13} className="text-emerald-400" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-[var(--brand-glass)] border border-[var(--brand-border)] rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-[var(--brand-border)]">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your website..."
              rows={1}
              disabled={isGenerating || !isReady}
              className="w-full px-4 py-3 pr-12 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)] resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
                !isDisabled
                  ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/25'
                  : 'text-[var(--text-faint)] cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <RotateCcw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-faint)] mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}