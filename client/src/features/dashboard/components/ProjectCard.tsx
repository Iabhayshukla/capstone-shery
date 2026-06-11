import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import { buttonPress } from "@/lib/animations";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  Code2,
  Star,
} from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "draft" | "archived";
  updatedAt: string;
  createdAt: string;
  thumbnail?: string;
  currentCode?: string | null;
}

interface ProjectCardProps {
  project: Project;
  layout?: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  index: number;
}

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Active", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  archived: { label: "Archived", variant: "default" },
};

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const getProjectGradient = (id: string) => {
  const gradients = [
    "bg-gradient-to-br from-blue-500 to-indigo-650 dark:from-blue-500/25 dark:to-indigo-500/25",
    "bg-gradient-to-br from-violet-500 to-purple-650 dark:from-violet-500/25 dark:to-purple-500/25",
    "bg-gradient-to-br from-rose-500 to-pink-650 dark:from-rose-500/25 dark:to-pink-500/25",
    "bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-500/25 dark:to-orange-600/25",
    "bg-gradient-to-br from-emerald-500 to-teal-650 dark:from-emerald-500/25 dark:to-emerald-500/25",
    "bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-500/25 dark:to-blue-600/25",
    "bg-gradient-to-br from-fuchsia-500 to-pink-600 dark:from-fuchsia-500/25 dark:to-pink-500/25",
    "bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-500/25 dark:to-rose-600/25",
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const getProjectListIconBg = (id: string) => {
  const bgStyles = [
    "bg-blue-50 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40",
    "bg-violet-50 dark:bg-violet-950/35 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/40",
    "bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
    "bg-orange-50 dark:bg-orange-950/35 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40",
    "bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
    "bg-cyan-50 dark:bg-cyan-950/35 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/40",
    "bg-fuchsia-50 dark:bg-fuchsia-950/35 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-900/40",
    "bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40",
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgStyles.length;
  return bgStyles[index];
};

const ProjectCard = ({
  project,
  layout = "grid",
  isFavorite,
  onToggleFavorite,
  onRename,
  onDelete,
  onDuplicate,
  index,
}: ProjectCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const status = statusMap[project.status] || { label: "Draft", variant: "warning" };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCardClick = () => {
    navigate(`/editor/${project.id}`);
  };

  // Dropdown options renderer
  const renderDropdown = () => (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(false);
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute right-0 top-full mt-1 w-44 py-1.5 rounded-xl bg-[var(--dropdown-bg)] backdrop-blur-xl border border-[var(--brand-border)] shadow-xl z-20"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename(project);
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
        >
          <Pencil size={14} />
          Rename
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(project);
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
        >
          <Copy size={14} />
          Duplicate
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/preview/${project.id}`, "_blank");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
        >
          <ExternalLink size={14} />
          Preview
        </button>
        <div className="border-t border-[var(--brand-border)] my-1" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400/80 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors w-full text-left"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </motion.div>
    </>
  );

  if (layout === "list") {
    return (
      <motion.div
        {...buttonPress}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        onClick={handleCardClick}
        className="group flex items-center justify-between p-4 glass-card hover:bg-[var(--brand-glass-hover)] transition-all duration-200 cursor-pointer"
        role="article"
        aria-label={`Project: ${project.name}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors duration-200 ${getProjectListIconBg(project.id)}`}>
            <Code2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                {project.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(project.id, e);
                }}
                className={`text-[var(--text-faint)] hover:text-yellow-500 transition-all ${
                  isFavorite ? "text-yellow-500 opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
                }`}
              >
                <Star size={13} className={isFavorite ? "fill-current" : ""} />
              </button>
            </div>
            {project.description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-md lg:max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-[90px]">
            <Clock size={12} />
            <span>{formatTimeAgo(project.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 size={14} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Project options"
              >
                <MoreVertical size={14} />
              </button>

              {isMenuOpen && renderDropdown()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid layout (without overflow-hidden on the parent card to avoid dropdown clipping)
  return (
    <motion.div
      {...buttonPress}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      className="group relative glass-card hover:bg-[var(--brand-glass-hover)] cursor-pointer transition-all duration-300 flex flex-col h-full"
      role="article"
      aria-label={`Project: ${project.name}`}
    >
      {/* Spotlight hover effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, rgba(108, 99, 255, 0.05), transparent 85%)`,
        }}
      />

      {/* Card visual header (with rounded-t-xl overflow-hidden) */}
      <div className={`relative h-32 border-b border-[var(--brand-border)] flex items-center justify-center overflow-hidden rounded-t-xl shrink-0 transition-colors duration-300 ${getProjectGradient(project.id)}`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.2] dark:opacity-[0.1] pointer-events-none mix-blend-overlay" />

        <Code2 size={24} className="text-white/80 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-200 group-hover:scale-110 transition-all duration-300 z-10" />

        {/* Favorite Star button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(project.id, e);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-glass)] hover:bg-[var(--brand-glass-hover)] text-[var(--text-muted)] hover:text-yellow-500 backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorite ? "text-yellow-500 opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={13} className={isFavorite ? "fill-current" : ""} />
        </button>

        {/* Status indicator badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col justify-between flex-grow relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 size={14} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Project options"
              >
                <MoreVertical size={14} />
              </button>

              {isMenuOpen && renderDropdown()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4 text-[11px] text-[var(--text-muted)]">
          <Clock size={11} />
          <span>{formatTimeAgo(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
