import { motion, AnimatePresence } from "framer-motion";
import ProjectCard, { type Project } from "./ProjectCard";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton, { ProjectCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { staggerContainer } from "@/lib/animations";
import { Plus, Sparkles } from "lucide-react";

interface ProjectGridProps {
  projects: Project[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNewProject: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDuplicate: (project: Project) => void;
}

const ProjectGrid = ({
  projects,
  isLoading,
  viewMode,
  favorites,
  onToggleFavorite,
  onNewProject,
  onRename,
  onDelete,
  onDuplicate,
}: ProjectGridProps) => {
  if (isLoading) {
    return (
      <div className={
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" 
          : "flex flex-col gap-3"
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          viewMode === "grid" ? (
            <ProjectCardSkeleton key={i} />
          ) : (
            <div key={i} className="p-4 glass-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton variant="avatar" className="rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="text" className="w-1/4 h-4" />
                  <Skeleton variant="text" className="w-1/2 h-3" />
                </div>
              </div>
              <Skeleton variant="button" className="w-16 h-8" />
            </div>
          )
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={40} className="text-[var(--text-muted)]" />}
        title="No projects found"
        description="Create a new AI-powered website project to get started."
        action={
          <Button
            onClick={onNewProject}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/25 rounded-xl"
          >
            <Plus size={18} />
            Create Project
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-3"
          }
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              layout={viewMode}
              isFavorite={favorites.includes(project.id)}
              onToggleFavorite={onToggleFavorite}
              index={i}
              onRename={onRename}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectGrid;
