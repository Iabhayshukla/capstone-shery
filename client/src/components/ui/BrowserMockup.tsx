import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const tabs = [
  {
    label: "Portfolio",
    content: (
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6C63FF]" />
          <div className="flex flex-col gap-1">
            <div className="w-24 h-2.5 rounded-full bg-white/80" />
            <div className="w-16 h-2 rounded-full bg-white/30" />
          </div>
        </div>
        <div className="w-3/4 h-3 rounded-full bg-white/60 mt-2" />
        <div className="w-1/2 h-3 rounded-full bg-white/30" />
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[#6C63FF]/30 border border-[#6C63FF]/20" />
          ))}
        </div>
        <div className="w-24 h-7 rounded-lg bg-[#6C63FF] mt-1" />
      </div>
    ),
  },
  {
    label: "Landing Page",
    content: (
      <div className="w-full h-full bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-4 flex flex-col gap-3">
        <div className="w-full h-6 rounded bg-white/5 flex items-center px-2 gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6C63FF]" />
          <div className="w-32 h-1.5 rounded-full bg-white/20" />
        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="w-48 h-4 rounded-full bg-white/70" />
          <div className="w-36 h-3 rounded-full bg-white/30" />
          <div className="flex gap-2 mt-1">
            <div className="w-20 h-6 rounded-lg bg-[#6C63FF]" />
            <div className="w-16 h-6 rounded-lg bg-white/10 border border-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Dashboard",
    content: (
      <div className="w-full h-full bg-[#0f0f1a] p-3 flex gap-2">
        <div className="w-1/4 flex flex-col gap-2">
          <div className="w-full h-3 rounded-full bg-[#6C63FF]/50" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-2.5 rounded-full bg-white/10" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 border border-white/10" />
            ))}
          </div>
          <div className="flex-1 rounded-lg bg-white/5 border border-white/10" />
        </div>
      </div>
    ),
  },
];

const BrowserMockup = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col">
      {/* Browser Top Bar */}
      <div className="bg-[#1a1a2e] px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
        {/* Dots */}
        <div className="flex gap-1.5">
          <div
            className="w-3 h-3 rounded-full bg-red-500/70 cursor-pointer hover:scale-150 transition-transform duration-150"
            title="Stop & reset"
            onClick={() => { setPaused(true); setActiveTab(0); }}
          />
          <div
            className={`w-3 h-3 rounded-full cursor-pointer hover:scale-150 transition-transform duration-150 ${paused ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-500/70'}`}
            title={paused ? 'Resume' : 'Pause'}
            onClick={() => setPaused(p => !p)}
          />
          <div
            className="w-3 h-3 rounded-full bg-green-500/70 cursor-pointer hover:scale-150 transition-transform duration-150"
            title="Play"
            onClick={() => setPaused(false)}
          />
        </div>

        {/* URL Bar */}
        <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-white/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400/50" />
          capstone-ai/preview
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                activeTab === i
                  ? "bg-[#6C63FF] text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {tabs.map((tab, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: activeTab === i ? 1 : 0,
              x: activeTab === i ? 0 : 20,
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {tab.content}
          </motion.div>
        ))}

        {/* AI Generating Overlay — briefly shows on tab switch */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute inset-0 bg-[#6C63FF]/10 flex items-center justify-center pointer-events-none"
        >
          <span className="text-[#6C63FF] text-xs font-medium tracking-widest uppercase">
            AI Generating...
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default BrowserMockup;