/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  forwardRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";


type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}


const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};


const toastConfig: Record<
  ToastType,
  { icon: ReactNode; bgClass: string; borderClass: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: <XCircle size={18} />,
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    iconColor: "text-red-400",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  info: {
    icon: <Info size={18} />,
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
};


const ToastItem = forwardRef<
  HTMLDivElement,
  {
    toast: Toast;
    onRemove: (id: string) => void;
  }
>(({ toast, onRemove }, ref) => {
  const config = toastConfig[toast.type];

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
        ${config.bgClass} ${config.borderClass}
        shadow-lg shadow-black/20 min-w-[300px] max-w-[420px]
      `}
    >
      <span className={config.iconColor}>{config.icon}</span>
      <p className="text-sm text-[var(--text-primary)] flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-0.5 rounded-md hover:bg-[var(--brand-glass-hover)]"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
});

ToastItem.displayName = "ToastItem";


export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
