import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { fetchProjectById } from "@/features/dashboard/api/projects.api";
import type { Project } from "@/features/dashboard/components/ProjectCard";
import { Loader2, ArrowLeft } from "lucide-react";

const PreviewPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !projectId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProjectById(accessToken, projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Failed to load preview.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken, projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="animate-spin text-brand-primary" size={24} />
        <span className="text-xs uppercase tracking-wider font-mono">Loading Preview...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400 p-4">
        <p className="text-red-400 text-sm font-medium">{error || "Project not found."}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-white">
      {/* Floating Back to Editor button */}
      <button
        onClick={() => navigate(`/editor/${project.id}`)}
        className="absolute bottom-4 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-950 border border-zinc-800/60 backdrop-blur text-white text-xs font-medium shadow-xl flex items-center gap-2 group transition-all"
        title="Open in editor"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Editor</span>
      </button>

      <iframe
        srcDoc={project.currentCode || "<!-- Empty --><div style='font-family:sans-serif; text-align:center; padding: 40px;'><h1>No website content generated yet.</h1><p>Open this project in the editor to write code.</p></div>"}
        title={project.name}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PreviewPage;
