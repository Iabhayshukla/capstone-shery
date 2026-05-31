import { useState } from 'react';

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isReady: boolean;
}

const SUGGESTIONS = [
  'Coffee shop landing page',
  'SaaS pricing page',
  'Portfolio site',
];

export default function PromptPanel({ onGenerate, isGenerating, isReady }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating || !isReady) return;
    onGenerate(prompt);
    setPrompt('');
  };

  const isDisabled = !prompt.trim() || isGenerating || !isReady;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px', padding:'0 10px 10px', overflow:'hidden' }}>
      <div style={{ fontSize:'9px', fontWeight:700, color:'#569cd6', textTransform:'uppercase', letterSpacing:'0.5px', paddingTop:'6px' }}>
        ✦ AI Prompt
      </div>

      {/* Suggestions */}
      <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
        {SUGGESTIONS.map(s => (
          <div
            key={s}
            onClick={() => setPrompt(s)}
            style={{ padding:'4px 8px', background:'#2d2d2d', border:'1px solid #3e3e3e', borderRadius:'4px', fontSize:'10px', color:'#9cdcfe', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#569cd6'; (e.currentTarget as HTMLDivElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3e3e3e'; (e.currentTarget as HTMLDivElement).style.color = '#9cdcfe'; }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
        placeholder="Describe your website..."
        disabled={isGenerating || !isReady}
        style={{ flex:1, minHeight:'70px', padding:'8px', background:'#1e1e1e', border:'1px solid #3e3e3e', borderRadius:'4px', fontSize:'10px', color:'#d4d4d4', resize:'none', fontFamily:'inherit', lineHeight:1.5, outline:'none', transition:'border-color 0.15s' }}
        onFocus={e => (e.target.style.borderColor = '#569cd6')}
        onBlur={e => (e.target.style.borderColor = '#3e3e3e')}
      />

      <div style={{ fontSize:'9px', color:'#555' }}>Ctrl+Enter to generate</div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          padding:'7px', borderRadius:'4px', border:'none',
          background: isDisabled ? '#2d2d2d' : '#0078d4',
          color: isDisabled ? '#555' : '#fff',
          fontSize:'11px', fontWeight:700, cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition:'all 0.15s', letterSpacing:'0.3px',
        }}
      >
        {isGenerating ? '⚙ Generating...' : !isReady ? '⏳ Loading...' : '▶ Generate'}
      </button>
    </div>
  );
}