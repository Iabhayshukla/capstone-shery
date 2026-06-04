import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard, { type Project } from "./ProjectCard";
import EmptyState from "@/components/ui/EmptyState";
import { ProjectCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { staggerContainer } from "@/lib/animations";
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

interface ProjectGridProps {
  projects: Project[];
  isLoading: boolean;
  onNewProject: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDuplicate: (project: Project) => void;
}

type SortOption = "updated" | "name" | "created";
type ViewMode = "grid" | "list";

const ProjectGrid = ({
  projects,
  isLoading,
  onNewProject,
  onRename,
  onDelete,
  onDuplicate,
}: ProjectGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");


  const filtered = projects
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "created")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

 
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

 
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={40} />}
        title="No projects yet"
        description="Create your first AI-powered website. Just describe what you want and let the magic happen!"
        action={
          <Button
            onClick={onNewProject}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/25"
          >
            <Plus size={18} />
            Create First Project
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
   
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
   
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
            id="search-projects"
          />
        </div>

        <div className="flex items-center gap-2">
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-8 pr-8 py-2 text-sm glass-input text-[var(--text-secondary)] cursor-pointer bg-transparent"
              aria-label="Sort projects"
            >
              <option value="updated" className="bg-[var(--brand-dark)]">Last Modified</option>
              <option value="name" className="bg-[var(--brand-dark)]">Name</option>
              <option value="created" className="bg-[var(--brand-dark)]">Date Created</option>
            </select>
            <SlidersHorizontal
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none"
            />
          </div>

      
          <div className="flex rounded-lg overflow-hidden border border-[var(--brand-border)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-brand-primary text-white"
                  : "text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)]"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-brand-primary text-white"
                  : "text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--brand-glass-hover)]"
              }`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

  
      {filtered.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-[var(--text-muted)] text-sm">
            No projects matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-brand-primary text-sm mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid */}
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
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
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
