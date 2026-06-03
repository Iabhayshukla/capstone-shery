import { motion } from "framer-motion";
import {
  Undo2,
  Redo2,
  Download,
  Eye,
  Code2,
} from "lucide-react";

import { exportHtml } from "../api/export.api";
import ViewportToggle from "@/features/preview/components/ViewportToggle";
import { ViewportSize } from "@/features/preview/types/preview.types";

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedSection: string | null;
  viewport: ViewportSize;
  onViewportChange: (v: ViewportSize) => void;
  showCode: boolean;
  onToggleCode: () => void;
  html: string;
}

export default function EditorToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedSection,
  viewport,
  onViewportChange,
  showCode,
  onToggleCode,
  html,
}: EditorToolbarProps) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        flex items-center justify-between
        px-4 py-2.5
        border-b border-[#2f2f2f]
        bg-[#1e1e1e]/95
        backdrop-blur-xl
        z-40
      "
    >
      {/* Left */}
      <div className="flex items-center gap-2">

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="
            p-2 rounded-lg
            text-gray-400
            hover:text-white
            hover:bg-white/5
            transition-colors
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          <Undo2 size={16} />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="
            p-2 rounded-lg
            text-gray-400
            hover:text-white
            hover:bg-white/5
            transition-colors
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-6 bg-[#333]" />

        {/* Export */}
        <button
          onClick={() => exportHtml(html)}
          className="
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            bg-emerald-500/10
            border border-emerald-500/20
            text-emerald-400
            hover:bg-emerald-500/20
            transition-all
          "
        >
          <Download size={14} />
          <span className="text-sm">Export</span>
        </button>

        {/* Selected Section */}
        {selectedSection && (
          <>
            <div className="w-px h-6 bg-[#333]" />

            <div
              className="
                px-3 py-1
                rounded-lg
                bg-blue-500/10
                border border-blue-500/20
                text-blue-400
                text-xs
                font-medium
              "
            >
              ◈ {selectedSection}
            </div>
          </>
        )}
      </div>

      {/* Center */}
      <div className="hidden md:flex">
        <ViewportToggle
          current={viewport}
          onChange={onViewportChange}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Code Toggle */}
        <button
          onClick={onToggleCode}
          className={`
            flex items-center gap-2
            px-3 py-2 rounded-lg
            border transition-all
            ${
              showCode
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-transparent text-gray-400 border-[#333] hover:bg-white/5"
            }
          `}
        >
          {showCode ? (
            <>
              <Eye size={14} />
              Preview
            </>
          ) : (
            <>
              <Code2 size={14} />
              Code
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}