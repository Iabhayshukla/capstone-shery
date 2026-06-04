import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { scaleIn, backdropAnimation } from "@/lib/animations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  danger?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  danger = false,
}: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";

  
      setTimeout(() => {
        const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
   
          <motion.div
            variants={backdropAnimation}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm"
          />

       
          <motion.div
            ref={contentRef}
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`
              relative w-full ${sizeClasses[size]}
              bg-[var(--modal-bg)] backdrop-blur-xl
              border border-[var(--brand-border)] rounded-2xl
              shadow-2xl shadow-black/40
              overflow-hidden
            `}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >

            {title && (
              <div
                className={`
                  flex items-center justify-between px-6 py-4
                  border-b border-[var(--brand-border)]
                  ${danger ? "bg-red-500/5" : ""}
                `}
              >
                <h2
                  className={`text-lg font-semibold ${danger ? "text-red-400" : "text-[var(--text-primary)]"}`}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            )}

       
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
