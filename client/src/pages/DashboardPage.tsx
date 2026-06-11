import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Activity,
  Lightbulb,
  ArrowRight,
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
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<"all" | "recent" | "active" | "archived" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "created">("updated");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("project_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentActivities, setRecentActivities] = useState<{ id: string; message: string; time: string }[]>([]);

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

  useEffect(() => {
    if (projects.length === 0) {
      setRecentActivities([]);
      return;
    }
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const acts = sorted.slice(0, 4).map((p) => {
      const isNew = p.createdAt === p.updatedAt;
      return {
        id: p.id + p.updatedAt,
        message: isNew ? `Created "${p.name}"` : `Modified "${p.name}"`,
        time: formatTimeAgo(p.updatedAt),
      };
    });
    setRecentActivities(acts);
  }, [projects]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id];
      localStorage.setItem("project_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreate = async (name: string, template: string) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const proj = await apiCreateProject(accessToken, name, template);

      setProjects((prev) => [proj, ...prev]);
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

  const filterRecent = (p: Project) => {
    const diff = Date.now() - new Date(p.updatedAt).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  const filteredProjects = projects
    .filter((p) => {
      if (activeTab === "active" && p.status !== "active") return false;
      if (activeTab === "archived" && p.status !== "archived") return false;
      if (activeTab === "recent" && !filterRecent(p)) return false;
      if (activeTab === "favorites" && !favorites.includes(p.id)) return false;
      if (searchQuery) {
        return p.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const getTabCount = (tab: "all" | "recent" | "active" | "archived" | "favorites") => {
    if (tab === "all") return projects.length;
    if (tab === "recent") return projects.filter(filterRecent).length;
    if (tab === "active") return projects.filter((p) => p.status === "active").length;
    if (tab === "archived") return projects.filter((p) => p.status === "archived").length;
    if (tab === "favorites") return projects.filter((p) => favorites.includes(p.id)).length;
    return 0;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.name || user?.email?.split("@")[0] || "Developer";
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const recentSuggestedProject = projects.length > 0
    ? [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;

  return (
    <div className="min-h-screen bg-brand-dark bg-dot-pattern relative text-[var(--text-secondary)] transition-colors duration-300">
      <Navbar />

      {/* Clean, premium background gradient highlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-brand-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full bg-brand-accent/[0.02] blur-[150px]" />
      </div>

      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[var(--brand-border)] pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1.5 leading-relaxed">
              Create and manage your AI-powered websites.
            </p>
          </div>

          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="group bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 shadow-lg shadow-brand-primary/25 transition-all duration-200 rounded-xl font-medium text-xs flex items-center gap-2"
          >
            <Plus size={15} className="group-hover:scale-110 transition-transform" />
            <span>New Project</span>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 glass-card p-5 mt-8">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium font-sans">Total Projects</span>
            <div className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{totalProjects}</div>
          </div>
          <div className="space-y-1 sm:border-l border-[var(--brand-border)] sm:pl-6">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium font-sans">Active Now</span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">{activeProjects}</div>
          </div>
          <div className="space-y-1 sm:border-l border-[var(--brand-border)] sm:pl-6">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium font-sans">Favorites</span>
            <div className="text-2xl font-semibold text-yellow-500 tracking-tight">{favorites.length}</div>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10 items-start">
          {/* Projects Main panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--brand-border)] pb-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                {(["all", "recent", "active", "archived", "favorites"] as const).map((tab) => {
                  const count = getTabCount(tab);
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all duration-200 shrink-0 ${activeTab === tab
                          ? "bg-[var(--brand-primary-light)] text-brand-primary border border-brand-primary/30"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] border border-transparent"
                        }`}
                    >
                      {tab}
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono rounded bg-[var(--brand-glass-input-bg)] border border-[var(--brand-border)] text-[var(--text-muted)]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:self-end">
                {/* Search */}
                <div className="relative w-full sm:w-52">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                  />
                </div>

                {/* Sort dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none pl-8 pr-8 py-1.5 text-xs glass-input text-[var(--text-secondary)] cursor-pointer focus:ring-1 focus:ring-brand-primary/25 font-sans"
                  >
                    <option value="updated" className="bg-[var(--dropdown-bg)] text-[var(--text-secondary)]">Last Modified</option>
                    <option value="name" className="bg-[var(--dropdown-bg)] text-[var(--text-secondary)]">Name</option>
                    <option value="created" className="bg-[var(--dropdown-bg)] text-[var(--text-secondary)]">Date Created</option>
                  </select>
                  <SlidersHorizontal size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>

                {/* View toggles */}
                <div className="flex rounded-lg overflow-hidden border border-[var(--brand-border)] p-0.5 bg-[var(--brand-glass)] shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1 rounded-md transition-all ${viewMode === "grid"
                        ? "bg-[var(--brand-glass-hover)] text-[var(--text-primary)] border border-[var(--brand-border-hover)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent"
                      }`}
                    title="Grid view"
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1 rounded-md transition-all ${viewMode === "list"
                        ? "bg-[var(--brand-glass-hover)] text-[var(--text-primary)] border border-[var(--brand-border-hover)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent"
                      }`}
                    title="List view"
                  >
                    <List size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid/List */}
            <ProjectGrid
              projects={filteredProjects}
              isLoading={isLoading}
              viewMode={viewMode}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNewProject={() => setIsNewModalOpen(true)}
              onRename={(project) => setRenameTarget(project)}
              onDelete={(project) => setDeleteTarget(project)}
              onDuplicate={handleDuplicate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI suggestions */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-yellow-500" />
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">AI Suggestions</h3>
              </div>
              <div className="space-y-3">
                {recentSuggestedProject ? (
                  <div className="p-3 bg-[var(--brand-glass-input-bg)] border border-[var(--brand-border)] rounded-xl space-y-2">
                    <span className="text-[9px] text-brand-primary font-medium uppercase font-sans tracking-wide">Continue Working</span>
                    <h4 className="text-xs font-medium text-[var(--text-primary)] truncate">{recentSuggestedProject.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                      Resume editing this project. Ask the AI to write more components or style pages.
                    </p>
                    <Button
                      onClick={() => navigate(`/editor/${recentSuggestedProject.id}`)}
                      className="w-full justify-between bg-[var(--brand-glass)] hover:bg-[var(--brand-glass-hover)] border border-[var(--brand-border)] hover:border-[var(--brand-border-hover)] text-[10px] h-8 text-[var(--text-secondary)] rounded-xl px-3 mt-1 font-normal shadow-sm"
                    >
                      <span>Resume in Editor</span>
                      <ArrowRight size={11} className="text-[var(--text-muted)]" />
                    </Button>
                  </div>
                ) : null}

                <div className="p-3 bg-[var(--brand-glass-input-bg)] border border-[var(--brand-border)] rounded-xl space-y-2">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium uppercase font-sans tracking-wide">Quick Start</span>
                  <h4 className="text-xs font-medium text-[var(--text-primary)]">SaaS Landing Page</h4>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Generate a modern marketing page with grid components, pricing, and dark layout.
                  </p>
                  <Button
                    onClick={() => handleCreate("SaaS Landing Page", "landing")}
                    className="w-full justify-between bg-[var(--brand-glass)] hover:bg-[var(--brand-glass-hover)] border border-[var(--brand-border)] hover:border-[var(--brand-border-hover)] text-[10px] h-8 text-[var(--text-secondary)] rounded-xl px-3 font-normal shadow-sm"
                  >
                    <span>Generate Template</span>
                    <Plus size={11} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--text-secondary)]" />
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Recent Activity</h3>
              </div>
              <div className="space-y-3.5">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div key={act.id} className="flex gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-border-hover)] shrink-0 mt-1.5" />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-[var(--text-secondary)] font-medium truncate">{act.message}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">{act.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[var(--text-muted)]">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
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