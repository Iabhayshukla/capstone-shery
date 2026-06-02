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
import {
  Plus,
  Sparkles,
  FolderOpen,
  Clock,
  TrendingUp,
} from "lucide-react";

// Mock data
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Portfolio Website",
    description: "My personal developer portfolio",
    status: "active",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "2",
    name: "Startup Landing Page",
    description: "SaaS product landing page",
    status: "active",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "3",
    name: "Restaurant Menu",
    description: "Online menu for local restaurant",
    status: "draft",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "4",
    name: "Event Invitation",
    description: "Wedding invitation website",
    status: "archived",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

const stats = [
  {
    label: "Total Projects",
    value: "4",
    icon: <FolderOpen size={18} />,
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
  },
  {
    label: "Active",
    value: "2",
    icon: <TrendingUp size={18} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Last Updated",
    value: "30m ago",
    icon: <Clock size={18} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const DashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const { addToast } = useToast();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleCreate = (name: string, template: string) => {
    const newProject: Project = {
      id: `${Date.now()}`,
      name,
      description: `${template} template`,
      status: "draft",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    addToast(`"${name}" created successfully!`, "success");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    addToast(`"${deleteTarget.name}" deleted`, "info");
    setDeleteTarget(null);
  };

  const handleRename = (newName: string) => {
    if (!renameTarget) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === renameTarget.id ? { ...p, name: newName } : p
      )
    );
    addToast(`Renamed to "${newName}"`, "success");
    setRenameTarget(null);
  };

  const handleDuplicate = (project: Project) => {
    const duplicate: Project = {
      ...project,
      id: `${Date.now()}`,
      name: `${project.name} (Copy)`,
      status: "draft",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicate, ...prev]);
    addToast(`"${project.name}" duplicated`, "success");
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-brand-primary/[0.04] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-brand-accent/[0.03] blur-[100px]" />
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
          {stats.map((stat, i) => (
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
