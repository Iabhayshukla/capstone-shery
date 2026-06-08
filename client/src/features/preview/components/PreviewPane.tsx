import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

import { useWebContainer } from "../hooks/useWebContainer";
import { useSectionClick } from "../hooks/useSectionClick";
import { ViewportSize } from "../types/preview.types";
import SectionHighlight from "./SectionHighlight";

interface PreviewPaneProps {
  html: string;
  onSectionClick?: (sectionId: string) => void;
  onConsoleError?: (message: string) => void;
  viewport?: ViewportSize;
  selectedSectionId?: string | null;
  hideHeader?: boolean;
  refreshTrigger?: number;
  /**
   * 'iframe'        = srcdoc preview — CSS perfectly works (DEFAULT)
   * 'webcontainer'  = dynamic server — React/Vue/Next ke liye
   */
  previewMethod?: 'iframe' | 'webcontainer';
}

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

// External images + fonts ke liye CSP
const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; font-src * data:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval';" />`;

// Section click + error bridge
const BRIDGE_SCRIPT = `
<script>
  window.onerror = function(msg, src, line) {
    window.parent.postMessage({ type: 'console_error', message: msg + ' (' + src + ':' + line + ')' }, '*');
  };
  document.addEventListener('click', function(e) {
    var target = e.target.closest('[data-section-id]');
    if (target) {
      window.parent.postMessage({ type: 'section_click', sectionId: target.getAttribute('data-section-id') }, '*');
    }
  });
  window.addEventListener('message', function(e) {
    document.querySelectorAll('[data-section-id]').forEach(function(el) { el.classList.remove('section-selected'); });
    if (e.data && e.data.type === 'highlight_section' && e.data.sectionId) {
      var t = document.querySelector('[data-section-id="' + e.data.sectionId + '"]');
      if (t) t.classList.add('section-selected');
    }
  });
<\/script>`;

// Section highlight CSS
const SECTION_STYLES = `
<style>
  [data-section-id] { cursor: pointer; transition: box-shadow 0.2s ease, outline 0.2s ease; }
  [data-section-id]:hover:not(.section-selected) { outline: 2px dashed rgba(99,102,241,0.6); outline-offset: 0px; }
  [data-section-id].section-selected {
    outline: 2px solid #6366f1;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.3), inset 0 0 20px rgba(99,102,241,0.05);
    animation: sectionGlow 2s ease infinite;
  }
  @keyframes sectionGlow {
    0%,100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.3), inset 0 0 20px rgba(99,102,241,0.05); }
    50% { box-shadow: 0 0 0 4px rgba(99,102,241,0.25), 0 0 35px rgba(99,102,241,0.5), inset 0 0 30px rgba(99,102,241,0.1); }
  }
</style>`;

/**
 * srcdoc ke liye HTML prepare karo:
 * 1. CSP meta inject (external images/fonts allow)
 * 2. Section highlight CSS inject
 * 3. Bridge script inject (section click + errors)
 *
 * Original HTML ki CSS <style> tags BILKUL NAHI chhedta — woh as-is rehti hain
 */
function prepareIframeSrcdoc(html: string): string {
  let doc = html;

  // Step 1: CSP meta inject karo (agar nahi hai)
  if (!doc.includes('Content-Security-Policy')) {
    if (/<head[^>]*>/i.test(doc)) {
      doc = doc.replace(/<head[^>]*>/i, (m) => `${m}\n  ${CSP_META}`);
    } else {
      // head tag nahi hai — prepend karo
      doc = `<head>${CSP_META}</head>\n` + doc;
    }
  }

  // Step 2: Section highlight styles inject karo (agar nahi hain)
  if (!doc.includes('section-selected')) {
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${SECTION_STYLES}\n</head>`);
    } else {
      doc = SECTION_STYLES + '\n' + doc;
    }
  }

  // Step 3: Bridge script inject karo (agar nahi hai)
  if (!doc.includes('section_click')) {
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${BRIDGE_SCRIPT}\n</body>`);
    } else {
      doc = doc + BRIDGE_SCRIPT;
    }
  }

  return doc;
}

function reloadIframe(iframe: HTMLIFrameElement): void {
  const src = iframe.src;
  if (src) {
    iframe.src = '';
    requestAnimationFrame(() => { iframe.src = src; });
  }
}

export default function PreviewPane({
  html,
  onSectionClick,
  onConsoleError,
  viewport = "desktop",
  selectedSectionId = null,
  hideHeader = false,
  refreshTrigger = 0,
  previewMethod = 'iframe',  // ✅ FIXED: default 'iframe' — CSS perfectly works via srcdoc
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { status, previewUrl, updateHtml } = useWebContainer();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const useWC = previewMethod === 'webcontainer';

  // ── IFRAME (srcdoc) mode — CSS directly inject hoti hai ──────────────────
  useEffect(() => {
    if (useWC) return;
    if (!iframeRef.current || !html) return;
    // srcdoc mein complete HTML set karo — CSS <style> tags safe hain
    iframeRef.current.srcdoc = prepareIframeSrcdoc(html);
  }, [html, useWC]);

  // ── WEBCONTAINER mode — React/Vue/Next ke liye ────────────────────────────
  useEffect(() => {
    if (!useWC) return;
    if (!html || status.status !== "ready") return;

    const run = async () => {
      try {
        await updateHtml(html);
        setTimeout(() => {
          if (iframeRef.current) reloadIframe(iframeRef.current);
        }, 150);
      } catch (err) {
        console.error('[PreviewPane] updateHtml error:', err);
      }
    };
    run();
  }, [html, status.status, updateHtml, useWC]);

  // Manual refresh
  useEffect(() => {
    if (refreshTrigger <= 0) return;
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useSectionClick({ iframeRef, onSectionClick, onConsoleError });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (useWC && html && status.status === "ready") {
        await updateHtml(html);
        setTimeout(() => {
          if (iframeRef.current) reloadIframe(iframeRef.current);
        }, 150);
      } else if (!useWC && iframeRef.current && html) {
        iframeRef.current.srcdoc = prepareIframeSrcdoc(html);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const iframeWidth = VIEWPORT_WIDTHS[viewport];
  const wcLoading = useWC && status.status !== "ready";

  if (!html) {
    return (
      <div className="h-full w-full rounded-xl border border-[#404040] bg-[#1f1f1f] flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl border border-[#404040] bg-[#2a2a2a] flex items-center justify-center"
        >
          <Globe size={32} className="text-gray-500" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-gray-300 font-medium">Live Preview</p>
          <p className="text-xs text-gray-500 mt-1">Generate HTML to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        hideHeader
          ? "h-full w-full flex flex-col overflow-hidden bg-transparent"
          : "h-full w-full flex flex-col rounded-xl overflow-hidden border border-[#404040] bg-[#1f1f1f]"
      }
    >
      {/* WC status bar */}
      {!hideHeader && useWC && status.status !== "ready" && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs">
          <Loader2 size={14} className="animate-spin" />
          {status.status === "booting" && "Booting WebContainer..."}
          {status.status === "installing" && "Installing dependencies..."}
          {status.status === "idle" && "Initializing..."}
          {status.status === "error" && `Error: ${status.error}`}
        </div>
      )}

      {/* Browser chrome */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#404040]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="ml-3 flex items-center gap-2 px-3 py-1 rounded-md bg-[#1a1a1a] border border-[#404040] text-[11px] text-gray-500 font-mono">
              <Globe size={10} />
              <span>
                {useWC
                  ? previewUrl ? "localhost:3001/index.html" : "starting-preview"
                  : "preview · srcdoc"}
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={useWC && status.status !== "ready"}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      )}

      {/* Preview area */}
      <div
        className={
          hideHeader
            ? "flex-1 relative overflow-hidden bg-transparent"
            : "flex-1 relative overflow-auto bg-[#2d2d2d] p-4"
        }
        style={{ minHeight: 0 }}
      >
        {status.status === "error" && useWC && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#1f1f1f]">
            <AlertCircle size={34} className="text-red-400" />
            <p className="text-red-400 text-sm">{status.error}</p>
          </div>
        )}

        {isRefreshing && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
        )}

        {wcLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 size={24} className="animate-spin text-yellow-400" />
          </div>
        )}

        <div
          className="mx-auto bg-white shadow-2xl transition-all duration-300 relative"
          style={{
            width: hideHeader ? '100%' : iframeWidth,
            height: '100%',
            minHeight: 0,
          }}
        >
          {(!useWC || previewUrl) ? (
            <>
              <iframe
                ref={iframeRef}
                src={useWC ? previewUrl ?? undefined : undefined}
                title="Live Preview"
                // srcdoc mode mein sandbox nahi — CSS + images free hain
                // WC mode mein allow-same-origin zaruri hai
                {...(useWC ? {
                  sandbox: "allow-scripts allow-same-origin allow-popups allow-forms allow-modals",
                } : {})}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: 'white',
                }}
              />
              <SectionHighlight
                selectedSectionId={selectedSectionId}
                iframeRef={iframeRef}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Starting preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}