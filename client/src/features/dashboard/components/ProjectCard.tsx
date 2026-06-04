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

// Generate gradient thumbnails deterministically
const thumbnailGradients = [
  "from-violet-600/40 via-purple-500/30 to-fuchsia-500/40",
  "from-blue-600/40 via-cyan-500/30 to-teal-500/40",
  "from-orange-500/40 via-pink-500/30 to-rose-500/40",
  "from-emerald-500/40 via-green-500/30 to-lime-500/40",
  "from-indigo-600/40 via-blue-500/30 to-sky-500/40",
  "from-amber-500/40 via-yellow-500/30 to-orange-500/40",
];

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
  onRename,
  onDelete,
  onDuplicate,
  index,
}: ProjectCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const gradient = thumbnailGradients[index % thumbnailGradients.length];
  const status = statusMap[project.status];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      {...buttonPress}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onMouseMove={handleMouseMove}
      className="group relative glass-card overflow-hidden cursor-pointer"
      onClick={() => navigate(`/editor/${project.id}`)}
      role="article"
      aria-label={`Project: ${project.name}`}
    >
      {/* Vercel-style cursor following hover glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(108, 99, 255, 0.12), transparent 80%)`,
        }}
      />

      <div className="absolute inset-0 rounded-[inherit] p-[1px] bg-gradient-to-br from-brand-primary/0 via-brand-primary/0 to-brand-accent/0 group-hover:from-brand-primary/45 group-hover:via-brand-primary/20 group-hover:to-brand-accent/45 transition-all duration-500 z-0" />

      {/* Content wrapper above the background spotlight */}
      <div className="relative z-10 flex flex-col h-full">
        <div
          className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10 flex flex-col gap-2 p-4 text-[10px] font-mono text-[var(--text-primary)] overflow-hidden">
            <span>{"<html>"}</span>
            <span>{"  <body>"}</span>
            <span>{"    <h1>Hello</h1>"}</span>
            <span>{"    <p>AI Generated</p>"}</span>
            <span>{"  </body>"}</span>
            <span>{"</html>"}</span>
          </div>

          <Code2 size={32} className="text-[var(--text-faint)]" />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium shadow-lg shadow-brand-primary/30"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate(`/editor/${project.id}`);
              }}
            >
              Open Editor
            </motion.button>
          </div>

          <div className="absolute top-3 left-3">
            <Badge variant={status.variant} dot size="sm">
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                  {project.description}
                </p>
              )}
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--brand-glass-hover)] transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Project options"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
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
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
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
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
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
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors w-full text-left"
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
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full text-left"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[var(--text-faint)]">
            <Clock size={12} />
            <span>{formatTimeAgo(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
