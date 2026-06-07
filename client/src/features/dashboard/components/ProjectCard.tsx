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
        className="absolute right-0 top-full mt-1 w-44 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-20"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename(project);
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left"
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
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left"
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
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left"
        >
          <ExternalLink size={14} />
          Preview
        </button>
        <div className="border-t border-zinc-150 dark:border-zinc-800 my-1" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-colors w-full text-left"
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
        className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl transition-all duration-200 cursor-pointer"
        role="article"
        aria-label={`Project: ${project.name}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850 shrink-0">
            <Code2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors truncate">
                {project.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(project.id, e);
                }}
                className={`text-zinc-350 dark:text-zinc-650 hover:text-yellow-500 transition-all ${
                  isFavorite ? "text-yellow-500 opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
                }`}
              >
                <Star size={13} className={isFavorite ? "fill-current" : ""} />
              </button>
            </div>
            {project.description && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-md lg:max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-[90px]">
            <Clock size={12} />
            <span>{formatTimeAgo(project.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
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
                className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-805 transition-colors opacity-0 group-hover:opacity-100"
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
      className="group relative bg-white dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800/80 rounded-xl cursor-pointer transition-all duration-300 flex flex-col h-full"
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
      <div className="relative h-32 bg-zinc-50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-900/60 flex items-center justify-center overflow-hidden rounded-t-xl shrink-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.15] pointer-events-none" />

        <Code2 size={24} className="text-zinc-400 dark:text-zinc-600 group-hover:scale-110 transition-transform duration-300 z-10" />

        {/* Favorite Star button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(project.id, e);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-yellow-500 backdrop-blur-md transition-all duration-200 z-10 ${
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
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
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
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
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
                className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Project options"
              >
                <MoreVertical size={14} />
              </button>

              {isMenuOpen && renderDropdown()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4 text-[11px] text-zinc-500">
          <Clock size={11} />
          <span>{formatTimeAgo(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
