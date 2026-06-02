import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Globe, RefreshCw, AlertCircle } from "lucide-react";

interface PreviewPaneProps {
  code: string;
  viewport: "desktop" | "tablet" | "mobile";
}

const PreviewPane = ({ code, viewport }: PreviewPaneProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Update iframe content
  useEffect(() => {
    if (!code || !iframeRef.current) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    } catch {
      setHasError(true);
    }

    // Simulate load time
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [code]);

  const handleRefresh = () => {
    if (!code || !iframeRef.current) return;
    setIsLoading(true);
    try {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    } catch {
      setHasError(true);
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  // Empty state (no code generated)
  if (!code) {
    return (
      <div className="h-full w-full rounded-xl border border-[var(--brand-border)] bg-brand-surface/30 flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-2xl bg-[var(--brand-glass)] border border-[var(--brand-border)] flex items-center justify-center"
        >
          <Globe size={32} className="text-[var(--text-faint)] animate-float" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-[var(--text-faint)] font-medium">Live Preview</p>
          <p className="text-xs text-[var(--text-faint)] mt-1">
            Enter a prompt to see your website here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col rounded-xl overflow-hidden border border-[var(--brand-border)] bg-brand-surface/30">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--brand-glass)] border-b border-[var(--brand-border)]">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-amber-400/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
          </div>

          {/* URL bar */}
          <div className="ml-3 flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--brand-glass-input-bg)] border border-[var(--brand-border)] text-[11px] text-[var(--text-faint)] font-mono">
            <Globe size={10} />
            <span>preview.novabuild.ai/{viewport}</span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)] transition-colors"
          title="Refresh preview"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative bg-white">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-brand-dark/80 flex items-center justify-center">
            <Skeleton variant="card" className="w-full h-full" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 z-10 bg-brand-dark flex flex-col items-center justify-center gap-3">
            <AlertCircle size={32} className="text-red-400/60" />
            <p className="text-sm text-red-400/60">Failed to load preview</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* iframe */}
        <iframe
          ref={iframeRef}
          title="Live Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default PreviewPane;
