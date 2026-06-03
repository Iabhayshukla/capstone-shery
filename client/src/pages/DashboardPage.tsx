import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import ProjectGrid from "@/features/dashboard/components/ProjectGrid";
import NewProjectModal from "@/features/dashboard/components/NewProjectModal";
import DeleteConfirmModal from "@/features/dashboard/components/DeleteConfirmModal";
import RenameModal from "@/features/dashboard/components/RenameModal";
import { useToast } from "@/components/ui/Toast";
import type { Project } from "@/features/dashboard/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { useAuth } from "@/features/auth";
import {
  fetchProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "@/features/dashboard/api/projects.api";
import {
  Plus,
  Sparkles,
  FolderOpen,
  Clock,
  TrendingUp,
} from "lucide-react";

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const DashboardPage = () => {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!accessToken) return;

    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const projs = await fetchProjects(accessToken);
        setProjects(projs);
      } catch (err: any) {
        addToast(err.message || "Failed to load projects.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [accessToken]);

  // Handlers
  const handleCreate = async (name: string, template: string) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const proj = await apiCreateProject(accessToken, name);
      let finalProj = proj;
      if (template && template !== "blank") {
        const defaultCode = `<!-- ${template} template -->\n<div class="p-8 text-center">\n  <h1 class="text-3xl font-bold">${name}</h1>\n  <p class="text-gray-600">Generated from the ${template} template.</p>\n</div>`;
        finalProj = await apiUpdateProject(accessToken, proj.id, { currentCode: defaultCode });
      }
      setProjects((prev) => [finalProj, ...prev]);
      addToast(`"${name}" created successfully!`, "success");
      setIsNewModalOpen(false);
    } catch (err: any) {
      addToast(err.message || "Failed to create project.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !accessToken) return;
    try {
      await apiDeleteProject(accessToken, deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast(`"${deleteTarget.name}" deleted`, "info");
    } catch (err: any) {
      addToast(err.message || "Failed to delete project.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRename = async (newName: string) => {
    if (!renameTarget || !accessToken) return;
    try {
      const updated = await apiUpdateProject(accessToken, renameTarget.id, { name: newName });
      setProjects((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? updated : p))
      );
      addToast(`Renamed to "${newName}"`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to rename project.", "error");
    } finally {
      setRenameTarget(null);
    }
  };

  const handleDuplicate = async (project: Project) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const duplicate = await apiCreateProject(accessToken, `${project.name} (Copy)`);
      let finalDuplicate = duplicate;
      if (project.currentCode) {
        finalDuplicate = await apiUpdateProject(accessToken, duplicate.id, {
          currentCode: project.currentCode,
        });
      }
      setProjects((prev) => [finalDuplicate, ...prev]);
      addToast(`"${project.name}" duplicated`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to duplicate project.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const lastUpdated = projects.length > 0 
    ? formatTimeAgo(projects[0].updatedAt) 
    : "Never";

  const dynamicStats = [
    {
      label: "Total Projects",
      value: String(totalProjects),
      icon: <FolderOpen size={18} />,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      label: "Active",
      value: String(activeProjects),
      icon: <TrendingUp size={18} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Last Updated",
      value: lastUpdated,
      icon: <Clock size={18} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark relative bg-dot-pattern">
      <Navbar />

      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-brand-primary/[0.04] blur-[100px] animate-float-orb-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-brand-accent/[0.03] blur-[100px] animate-float-orb-2" />
      </div>

      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-[var(--text-primary)]"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[var(--text-muted)] mt-1"
            >
              Manage your AI-generated websites
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all"
              id="new-project-btn"
            >
              <Plus size={18} />
              New Project
            </Button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {dynamicStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-6"
        >
          <Sparkles size={16} className="text-brand-primary" />
          <h2 className="text-lg font-semibold text-[var(--text-secondary)]">Your Projects</h2>
          <span className="text-xs text-[var(--text-faint)] ml-1">
            ({projects.length})
          </span>
        </motion.div>

        {/* Project Grid */}
        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          onNewProject={() => setIsNewModalOpen(true)}
          onRename={(project) => setRenameTarget(project)}
          onDelete={(project) => setDeleteTarget(project)}
          onDuplicate={handleDuplicate}
        />
      </motion.main>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreate}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        projectName={deleteTarget?.name || ""}
      />
      <RenameModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
        currentName={renameTarget?.name || ""}
      />
    </div>
  );
};

export default DashboardPage;
