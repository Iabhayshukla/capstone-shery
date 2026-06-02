import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Undo2,
  Redo2,
  Check,
  Loader2,
  Code2,
  Eye,
} from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface EditorToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
  generatedCode: string;
}

const viewportButtons: { id: ViewportSize; icon: React.ReactNode; label: string }[] = [
  { id: "desktop", icon: <Monitor size={15} />, label: "Desktop" },
  { id: "tablet", icon: <Tablet size={15} />, label: "Tablet" },
  { id: "mobile", icon: <Smartphone size={15} />, label: "Mobile" },
];

const EditorToolbar = ({
  projectName,
  onProjectNameChange,
  viewport,
  onViewportChange,
  generatedCode,
}: EditorToolbarProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(projectName);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleSaveName = () => {
    if (editName.trim()) {
      onProjectNameChange(editName.trim());
    }
    setIsEditing(false);
  };

  const handleExport = async () => {
    if (!generatedCode) return;
    setIsExporting(true);

    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create and download ZIP-like file (simplified as HTML download)
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--brand-border)] bg-brand-dark/95 backdrop-blur-xl z-40"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--brand-border)]" />

        {/* Project Name */}
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setEditName(projectName);
                setIsEditing(false);
              }
            }}
            className="px-2 py-1 text-sm font-medium text-[var(--text-primary)] bg-[var(--brand-glass-input-bg)] border border-[var(--brand-border)] rounded-lg outline-none focus:border-brand-primary w-48"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditName(projectName);
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors"
          >
            <Code2 size={14} className="text-brand-primary" />
            {projectName}
          </button>
        )}
      </div>

      {/* Center section - Viewport Toggles */}
      <div className="hidden md:flex items-center gap-1 bg-[var(--brand-glass)] rounded-lg p-1 border border-[var(--brand-border)]">
        {viewportButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => onViewportChange(btn.id)}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                viewport === btn.id
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
              }
            `}
            title={btn.label}
          >
            {viewport === btn.id && (
              <motion.div
                layoutId="viewport-indicator"
                className="absolute inset-0 bg-brand-primary/20 rounded-md border border-brand-primary/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{btn.icon}</span>
            <span className="relative z-10 hidden lg:inline">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            className="p-2 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)] transition-colors"
            title="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            className="p-2 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)] transition-colors"
            title="Redo"
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="w-px h-6 bg-[var(--brand-border)] hidden sm:block" />

        {/* Preview in new tab */}
        <button
          onClick={() => {
            if (!generatedCode) return;
            const w = window.open("", "_blank");
            if (w) {
              w.document.write(generatedCode);
              w.document.close();
            }
          }}
          disabled={!generatedCode}
          className="p-2 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Open preview in new tab"
        >
          <Eye size={15} />
        </button>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={!generatedCode || isExporting}
          className={`
            px-4 gap-2 text-sm font-medium transition-all
            ${
              exportDone
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20"
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
          id="export-btn"
        >
          {isExporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Exporting...
            </>
          ) : exportDone ? (
            <>
              <Check size={14} />
              Downloaded!
            </>
          ) : (
            <>
              <Download size={14} />
              Export
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default EditorToolbar;
