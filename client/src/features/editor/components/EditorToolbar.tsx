import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo2,
  Redo2,
  Download,
  Eye,
  Code2,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
} from "lucide-react";
import { exportHtml } from "../api/export.api";
import type { ViewportSize } from "@/features/preview/types/preview.types";

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

// Theme Hook
function useTheme(): { isDark: boolean; toggle: () => void } {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = (): void => {
    setIsDark((prev: boolean) => !prev);
  };

  return { isDark, toggle };
}

// Viewport options
const VIEWPORT_OPTIONS: readonly {
  value: ViewportSize;
  icon: typeof Monitor;
  label: string;
  width: string;
}[] = [
  { value: "desktop", icon: Monitor, label: "Desktop", width: "1280px" },
  { value: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
  { value: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
] as const;

// Toolbar Button Component
function ToolbarBtn({
  onClick,
  disabled,
  active,
  title,
  children,
  variant = "ghost",
}: {
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  variant?: "ghost" | "primary" | "success" | "code";
}): React.ReactElement {
  const base: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.38 : 1,
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap" as const,
    outline: "none",
    background: "transparent",
  };

  const variants: Record<string, React.CSSProperties> = {
    ghost: {
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      background: active ? "var(--brand-glass-hover)" : "transparent",
      borderColor: active ? "var(--brand-border-hover)" : "transparent",
    },
    primary: {
      color: "#fff",
      background: "var(--brand-primary)",
      borderColor: "rgba(108,99,255,0.4)",
      boxShadow: "0 0 12px rgba(108,99,255,0.25)",
    },
    success: {
      color: "#22c55e",
      background: "rgba(34,197,94,0.1)",
      borderColor: "rgba(34,197,94,0.25)",
    },
    code: {
      color: active ? "#fff" : "var(--text-muted)",
      background: active ? "#0078d4" : "transparent",
      borderColor: active ? "#0078d4" : "var(--brand-border)",
    },
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </motion.button>
  );
}

// Divider Component
function Divider(): React.ReactElement {
  return (
    <div
      style={{
        width: "1px",
        height: "20px",
        background: "var(--brand-border)",
        flexShrink: 0,
      }}
    />
  );
}

// Main Toolbar Component
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
}: EditorToolbarProps): React.ReactElement {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [viewportOpen, setViewportOpen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = (): void => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentViewport = VIEWPORT_OPTIONS.find((v) => v.value === viewport);
  const ViewportIcon = currentViewport?.icon || Monitor;

  const isMobile: boolean = windowWidth < 768;
  const isSmallMobile: boolean = windowWidth < 480;

  const handleViewportChange = (value: ViewportSize): void => {
    onViewportChange(value);
    setViewportOpen(false);
  };

  const handleExport = (): void => {
    exportHtml(html);
  };

  const handleToggleViewport = (): void => {
    setViewportOpen((prev: boolean) => !prev);
  };

  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "2px" : "4px",
        padding: isMobile ? "4px 8px" : "6px 12px",
        borderBottom: "1px solid var(--brand-border)",
        background: "var(--brand-surface)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
        zIndex: 50,
        minHeight: isMobile ? "44px" : "48px",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "thin",
      }}
    >
      {/* Undo / Redo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          flexShrink: 0,
        }}
      >
        <ToolbarBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={isMobile ? 13 : 15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo2 size={isMobile ? 13 : 15} />
        </ToolbarBtn>
      </div>

      <Divider />

      {/* Export */}
      <ToolbarBtn onClick={handleExport} variant="success" title="Export HTML">
        <Download size={isMobile ? 12 : 14} />
        {!isSmallMobile && <span>Export</span>}
      </ToolbarBtn>

      <Divider />

      {/* Code toggle */}
      <ToolbarBtn
        onClick={onToggleCode}
        variant="code"
        active={showCode}
        title={showCode ? "Hide Code" : "Show Code"}
      >
        {showCode ? (
          <Eye size={isMobile ? 12 : 14} />
        ) : (
          <Code2 size={isMobile ? 12 : 14} />
        )}
        {!isSmallMobile && <span>{showCode ? "Preview" : "Code"}</span>}
      </ToolbarBtn>

      {/* Selected Section Badge */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -6 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: isMobile ? "4px 8px" : "4px 10px",
              borderRadius: "8px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              fontSize: isMobile ? "10px" : "11px",
              color: "#60a5fa",
              fontWeight: 500,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#3b82f6",
              }}
            />
            {isMobile
              ? selectedSection.substring(0, 12)
              : `◈ ${selectedSection}`}
            {isMobile && selectedSection.length > 12 && "..."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ flex: 1, minWidth: "8px" }} />

      {/* Viewport Switcher */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ToolbarBtn
          onClick={handleToggleViewport}
          active={viewportOpen}
          title="Change viewport"
        >
          <ViewportIcon size={isMobile ? 12 : 14} />
          {!isSmallMobile && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: isMobile ? "10px" : "11px",
              }}
            >
              {currentViewport?.width}
            </span>
          )}
          <ChevronDown
            size={isMobile ? 10 : 12}
            style={{
              color: "var(--text-faint)",
              transform: viewportOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </ToolbarBtn>

        <AnimatePresence>
          {viewportOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: isMobile ? "0" : "auto",
                left: isMobile ? "auto" : "50%",
                transform: isMobile ? "translateX(0)" : "translateX(-50%)",
                background: "var(--brand-surface)",
                border: "1px solid var(--brand-border)",
                borderRadius: "10px",
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 100,
                minWidth: isMobile ? "120px" : "140px",
              }}
            >
              {VIEWPORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = viewport === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleViewportChange(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: isMobile ? "6px 8px" : "7px 10px",
                      borderRadius: "7px",
                      fontSize: isMobile ? "11px" : "12px",
                      cursor: "pointer",
                      border: "none",
                      background: isActive
                        ? "var(--brand-primary-light)"
                        : "transparent",
                      color: isActive
                        ? "var(--brand-primary)"
                        : "var(--text-muted)",
                      fontWeight: isActive ? 600 : 400,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Icon size={isMobile ? 11 : 13} />
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    {!isSmallMobile && (
                      <span
                        style={{ fontSize: "10px", color: "var(--text-faint)" }}
                      >
                        {opt.width}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Divider />

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        onClick={toggleTheme}
        title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? "28px" : "32px",
          height: isMobile ? "28px" : "32px",
          borderRadius: "8px",
          border: "1px solid var(--brand-border)",
          background: "var(--brand-glass)",
          cursor: "pointer",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute" }}
            >
              <Sun size={isMobile ? 13 : 15} style={{ color: "#f59e0b" }} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute" }}
            >
              <Moon
                size={isMobile ? 13 : 15}
                style={{ color: "var(--brand-primary)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Custom scrollbar styling */}
      <style>
        {`
          @media (max-width: 768px) {
            div::-webkit-scrollbar {
              height: 3px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: var(--border);
              border-radius: 3px;
            }
          }
        `}
      </style>
    </motion.div>
  );
}