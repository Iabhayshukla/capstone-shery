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
  }, [accessToken, addToast]);

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
  const lastUpdated = projects.length > 0 ? formatTimeAgo(projects[0].updatedAt) : "Never";

  const dynamicStats = [
    {
      label: "Total Projects",
      value: String(totalProjects),
      icon: <FolderOpen size={16} />,
      // accent color classes — tweak to match your brand tokens
      iconBg: "bg-brand-primary/10",
      iconColor: "text-brand-primary",
      glowColor: "shadow-brand-primary/20",
      topBorder: "from-brand-primary/40 via-brand-primary/10 to-transparent",
      delta: totalProjects > 0 ? `${totalProjects} total` : null,
    },
    {
      label: "Active",
      value: String(activeProjects),
      icon: <TrendingUp size={16} />,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      glowColor: "shadow-emerald-500/20",
      topBorder: "from-emerald-400/40 via-emerald-400/10 to-transparent",
      delta:
        totalProjects > 0
          ? `${Math.round((activeProjects / totalProjects) * 100)}% active`
          : null,
    },
    {
      label: "Last Updated",
      value: lastUpdated,
      icon: <Clock size={16} />,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      glowColor: "shadow-amber-500/20",
      topBorder: "from-amber-400/40 via-amber-400/10 to-transparent",
      delta: null,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark relative bg-dot-pattern">
      <Navbar />

      {/* Background Orbs — boosted opacity so they're actually visible */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[3%] w-[500px] h-[500px] rounded-full bg-brand-primary/[0.07] blur-[120px] animate-float-orb-1" />
        <div className="absolute bottom-[8%] right-[5%] w-[420px] h-[420px] rounded-full bg-brand-accent/[0.06] blur-[120px] animate-float-orb-2" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-brand-primary/[0.03] blur-[80px]" />
      </div>

      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"
      >
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-1"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)] to-brand-primary/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              {/* Live sync indicator */}
              {!isLoading && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {totalProjects} synced
                </span>
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[var(--text-muted)] text-sm"
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
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 transition-all duration-200"
              id="new-project-btn"
            >
              <Plus size={16} />
              New Project
            </Button>
          </motion.div>
        </div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {dynamicStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`glass-card p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 shadow-lg ${stat.glowColor}`}
            >
              {/* top shimmer line */}
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${stat.topBorder}`}
              />

              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}
                >
                  {stat.icon}
                </div>
                {stat.delta && (
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-2 py-0.5">
                    {stat.delta}
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--text-faint)] uppercase tracking-widest font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Section Title ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2.5 mb-6"
        >
          <div className="w-5 h-5 rounded-md bg-brand-primary/15 flex items-center justify-center">
            <Sparkles size={12} className="text-brand-primary" />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Your Projects
          </h2>
          <span className="text-xs font-mono text-[var(--text-faint)] bg-[var(--brand-glass)] border border-[var(--brand-border)] rounded-full px-2 py-0.5">
            {projects.length}
          </span>
        </motion.div>

        {/* ── Project Grid ── */}
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