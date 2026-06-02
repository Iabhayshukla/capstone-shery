import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
   
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="relative mb-6"
      >
   
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-brand-primary/10 blur-xl" />
        <div className="relative w-24 h-24 rounded-2xl bg-[var(--brand-glass)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--text-faint)]">
          {icon || <FolderOpen size={40} />}
        </div>
      </motion.div>

   
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-[var(--text-secondary)] mb-2"
      >
        {title}
      </motion.h3>

   
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[var(--text-muted)] text-sm max-w-sm leading-relaxed mb-6"
      >
        {description}
      </motion.p>

   
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
