import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
}

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

/**
 * Forces an iframe to reload by bouncing its src through an empty string.
 * Direct src = src self-assignment is a no-op in modern browsers and triggers
 * the no-self-assign ESLint rule.
 */
function reloadIframe(iframe: HTMLIFrameElement): void {
  const src = iframe.src;
  iframe.src = '';
  iframe.src = src;
}

export default function PreviewPane({
  html,
  onSectionClick,
  onConsoleError,
  viewport = "desktop",
  selectedSectionId = null,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { status, previewUrl, updateHtml } = useWebContainer();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!html || status.status !== "ready") return;

    const run = async () => {
      try {
        await updateHtml(html);

        setTimeout(() => {
          if (iframeRef.current) {
            reloadIframe(iframeRef.current);
          }
        }, 100);
      } catch (err) {
        console.error(err);
      }
    };

    run();
  }, [html, status.status, updateHtml]);

  useSectionClick({
    iframeRef,
    onSectionClick,
    onConsoleError,
  });

  const handleRefresh = async () => {
    if (!html || status.status !== "ready") return;

    setIsRefreshing(true);

    try {
      await updateHtml(html);

      setTimeout(() => {
        if (iframeRef.current) {
          reloadIframe(iframeRef.current);
        }
      }, 100);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const iframeWidth = VIEWPORT_WIDTHS[viewport];

  // Empty state
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
          <p className="text-sm text-gray-300 font-medium">
            Live Preview
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Generate HTML to see preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col rounded-xl overflow-hidden border border-[#404040] bg-[#1f1f1f]">

      {/* Status Bar */}
      {status.status !== "ready" && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs">
          <Loader2 size={14} className="animate-spin" />

          {status.status === "booting" &&
            "Booting WebContainer..."}

          {status.status === "installing" &&
            "Installing dependencies..."}

          {status.status === "idle" &&
            "Initializing..."}

          {status.status === "error" &&
            `Error: ${status.error}`}
        </div>
      )}

      {/* Browser Chrome */}
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
              {previewUrl
                ? "localhost:3001/index.html"
                : "starting-preview"}
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={status.status !== "ready"}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-auto bg-[#2d2d2d] p-4">

        {status.status === "error" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#1f1f1f]">
            <AlertCircle size={34} className="text-red-400" />

            <p className="text-red-400 text-sm">
              {status.error}
            </p>
          </div>
        )}

        {isRefreshing && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin text-white"
            />
          </div>
        )}

        <div
          className="mx-auto bg-white shadow-2xl transition-all duration-300 h-full relative"
          style={{
            width: iframeWidth,
            minHeight: "100%",
          }}
        >
          {previewUrl ? (
            <>
              <iframe
                ref={iframeRef}
                src={previewUrl}
                title="Live Preview"
                className="w-full h-full border-0"
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