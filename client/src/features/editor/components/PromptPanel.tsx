import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Trash2, RotateCcw, Lightbulb, RefreshCw } from 'lucide-react';

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isReady: boolean;
  lastPrompt?: string;
  onRegenerate?: () => void;
  selectedSection?: string | null;
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

export default function PromptPanel({
  onGenerate,
  isGenerating,
  isReady,
  lastPrompt,
  onRegenerate,
  selectedSection,
}: PromptPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
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
      content: selectedSection
        ? `[${selectedSection}] ${input.trim()}`
        : input.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    onGenerate(
      selectedSection
        ? `Edit only the "${selectedSection}" section: ${input.trim()}`
        : input.trim()
    );
    setInput('');
  };

  useEffect(() => {
    if (!isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'user') {
      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: selectedSection
          ? `Updated the "${selectedSection}" section! Check the preview.`
          : 'Website generated! Check the preview. Click any section to select and edit it.',
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
    <div className="flex flex-col h-full" style={{ background: 'var(--brand-surface)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--brand-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--brand-primary-light)' }}
          >
            <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            AI Prompt
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Regenerate button (shows when there's a last prompt) */}
          <AnimatePresence>
            {lastPrompt && !isGenerating && onRegenerate && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegenerate}
                title={`Regenerate: "${lastPrompt}"`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: 'rgba(108,99,255,0.12)',
                  border: '1px solid rgba(108,99,255,0.25)',
                  color: 'var(--brand-primary)',
                }}
              >
                <RefreshCw size={11} />
                Regenerate
              </motion.button>
            )}
          </AnimatePresence>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-faint)' }}
              title="Clear conversation"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Selected Section Badge */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--brand-border)' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
              <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 500 }}>
                Editing: {selectedSection}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Welcome State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-6"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--brand-primary-light)' }}
            >
              <Sparkles size={20} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {selectedSection ? `Edit "${selectedSection}"` : 'What would you like to build?'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', maxWidth: '220px', marginBottom: '20px' }}>
              {selectedSection
                ? 'Describe what you want to change in this section.'
                : 'Describe your website and AI will generate it instantly.'}
            </p>

            {!isReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
                style={{
                  background: 'rgba(234,179,8,0.1)',
                  border: '1px solid rgba(234,179,8,0.2)',
                  fontSize: '11px',
                  color: '#eab308',
                }}
              >
                <RotateCcw size={11} className="animate-spin" />
                Preview loading... please wait
              </motion.div>
            )}

            {/* Quick prompts */}
            {!selectedSection && (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                  <Lightbulb size={11} />
                  <span>Try these</span>
                </div>
                {SAMPLE_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    onClick={() => setInput(p)}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--brand-glass)',
                      border: '1px solid var(--brand-border)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    "{p}"
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Chat Messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: msg.role === 'user'
                    ? 'var(--brand-primary-light)'
                    : 'rgba(34,197,94,0.15)',
                }}
              >
                {msg.role === 'user'
                  ? <User size={11} style={{ color: 'var(--brand-primary)' }} />
                  : <Bot size={11} style={{ color: '#22c55e' }} />}
              </div>
              <div
                className="max-w-[85%] px-3 py-2 rounded-xl"
                style={{
                  fontSize: '12px',
                  lineHeight: '1.6',
                  background: msg.role === 'user'
                    ? 'var(--brand-primary-light)'
                    : 'var(--brand-glass)',
                  border: msg.role === 'assistant' ? '1px solid var(--brand-border)' : 'none',
                  color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              <Bot size={11} style={{ color: '#22c55e' }} />
            </div>
            <div
              className="px-3 py-2.5 rounded-xl flex items-center gap-1"
              style={{
                background: 'var(--brand-glass)',
                border: '1px solid var(--brand-border)',
              }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="typing-dot"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="px-3 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--brand-border)' }}
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSection
                ? `Edit "${selectedSection}"...`
                : 'Describe your website...'
            }
            rows={1}
            disabled={isGenerating || !isReady}
            className="glass-input w-full px-3 py-2.5 pr-10 text-sm resize-none disabled:opacity-50"
            style={{ color: 'var(--text-primary)', fontSize: '13px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="absolute right-2 bottom-2 p-1.5 rounded-lg transition-all"
            style={{
              background: !isDisabled ? 'var(--brand-primary)' : 'transparent',
              color: !isDisabled ? '#fff' : 'var(--text-faint)',
            }}
          >
            {isGenerating
              ? <RotateCcw size={13} className="animate-spin" />
              : <Send size={13} />}
          </button>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '6px', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}