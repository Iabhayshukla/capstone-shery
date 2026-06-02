import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import PromptPanel from "./PromptPanel";
import PreviewPane from "@/features/preview/components/PreviewPane";
import EditorToolbar from "./EditorToolbar";
import { pageTransition } from "@/lib/animations";

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const EditorLayout = () => {
  const [leftWidth, setLeftWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [projectName, setProjectName] = useState("My Awesome Website");
  const [generatedCode, setGeneratedCode] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Resizing logic
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      // Clamp between 320px and 60% of container
      const maxWidth = rect.width * 0.6;
      setLeftWidth(Math.max(320, Math.min(newWidth, maxWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Handle code generation from prompt
  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="h-screen flex flex-col bg-brand-dark overflow-hidden"
    >
      {/* Toolbar */}
      <EditorToolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        viewport={viewport}
        onViewportChange={setViewport}
        generatedCode={generatedCode}
      />

      {/* Main Split Layout */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden editor-split"
      >
        {/* Left Panel: Prompt */}
        <div
          style={{ width: `${leftWidth}px`, minWidth: "320px" }}
          className="flex-shrink-0 border-r border-[var(--brand-border)] overflow-hidden flex flex-col"
        >
          <PromptPanel onCodeGenerated={handleCodeGenerated} />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className={`resizer ${isResizing ? "bg-brand-primary" : ""}`}
          role="separator"
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setLeftWidth((w) => Math.max(320, w - 20));
            if (e.key === "ArrowRight")
              setLeftWidth((w) => Math.min(800, w + 20));
          }}
        />

        {/* Right Panel: Preview */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-brand-darker/50 p-4">
          <div
            className="h-full transition-all duration-500 ease-spring"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
            }}
          >
            <PreviewPane code={generatedCode} viewport={viewport} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorLayout;
