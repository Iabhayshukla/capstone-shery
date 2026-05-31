import { useState, useEffect } from 'react';
import { Layers, Server, Sparkles, Activity, ArrowRight, Github } from 'lucide-react';


function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [healthStatus, setHealthStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbStatus, setDbStatus] = useState<string>('Initializing...');
  const [streamData, setStreamData] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [projects, setProjects] = useState<any[]>([]);
 
  const generateWebsite = async () => {
    if (!prompt.trim()) {
    alert("Please enter a prompt");
    return;
  }

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt
          }),
        }
      );

      const data = await response.json();

      setGeneratedHtml(data.html);
      fetchProjects();
    } 
    catch (error) {
      alert("Failed to generate website");
      console.error(error);
    }
    finally {

      setLoading(false);

    }
  };
  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/projects"
      );

      const data = await response.json();

      setProjects(data);
    }
    catch (error) {
      console.error(error);
    }
};

  const startStreaming = () => {

    setStreamData("");

    const eventSource = new EventSource(
      "http://127.0.0.1:8000/stream"
    );

    eventSource.onmessage = (event) => {

      setStreamData((prev) => prev + event.data);

    };

    eventSource.onerror = () => {

      eventSource.close();

    };
  };
  
  useEffect(() => {
    // Attempt to contact server health endpoint
    fetch('http://127.0.0.1:8000/')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Server returned error status');
      })
      .then((data) => {
        if (data.message) {
          setHealthStatus('connected');
          setDbStatus(data.database || 'Connected');
        } else {
          setHealthStatus('error');
          setDbStatus('Failed health check values');
        }
      })
      .catch(() => {
        setHealthStatus('error');
        setDbStatus('Server offline');
      });
  }, []);
  useEffect(() => {
  fetchProjects();
}, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Capstone <span className="text-indigo-400 font-medium">Shery</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
            </a>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                healthStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                healthStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
              }`} />
              API: {healthStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>React + Vite + FastAPI + Nova Pro</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            AI Website Builder <br />
            Generate Production-Ready Websites with Amazon Nova Pro
          </h1>
          <div className="text-lg text-slate-400 leading-relaxed mb-8">
            <div className="max-w-2xl mx-auto mt-6">

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to generate..."
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
            <div className="mt-3 text-sm text-slate-500 text-left">
              <p>Try:</p>
              <p>• SaaS Landing Page</p>
              <p>• Restaurant Website</p>
              <p>• AI Startup Homepage</p>
              <p>• Personal Portfolio Website</p>
            </div>
           
          
            <button
              onClick={generateWebsite}
              disabled={loading}
              className={`mt-4 px-6 py-3 rounded-xl text-white transition-all ${
                loading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}>
              {loading ? "Generating..." : "Generate Website"}
            </button>

          </div>
            The platform is powered by React, Vite, FastAPI, AWS Bedrock and Amazon Nova Pro.
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">

            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 cursor-pointer flex items-center gap-2 group">
              Explore Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={startStreaming}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 font-semibold text-white shadow-lg transition-all duration-300"
            >
              Start AI Streaming
            </button>

          </div>
          {generatedHtml && (
  <div className="max-w-7xl mx-auto mb-16">

    <h2 className="text-3xl font-bold mb-6 text-center">
      Website Preview
    </h2>
    <div className="flex justify-center gap-3 mb-6">

      <button
        onClick={() => setActiveTab("preview")}
        className={`px-4 py-2 rounded-lg ${
          activeTab === "preview"
            ? "bg-indigo-600 text-white"
            : "bg-slate-800 text-slate-300"
        }`}
      >
        Preview
      </button>

  <button
    onClick={() => setActiveTab("code")}
    className={`px-4 py-2 rounded-lg ${
      activeTab === "code"
        ? "bg-indigo-600 text-white"
        : "bg-slate-800 text-slate-300"
    }`}
  >
    Code
  </button>

</div>
    <div className="flex justify-center mb-4">
  <button
    onClick={() => {
      const blob = new Blob([generatedHtml], {
        type: "text/html",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "website.html";
      a.click();

      URL.revokeObjectURL(url);
    }}
    className="px-5 py-2 bg-emerald-600 rounded-xl text-white hover:bg-emerald-500"
  >
    Download HTML
  </button>
</div>
    {activeTab === "preview" ? (

  <iframe
    title="Website Preview"
    srcDoc={generatedHtml}
    className="w-full h-[900px] rounded-2xl border border-slate-700 bg-white shadow-2xl"
    sandbox="allow-scripts"
  />

) : (

  <pre className="w-full h-[900px] overflow-auto rounded-2xl border border-slate-700 bg-slate-950 text-emerald-400 p-6 text-sm">
    <code>
      {generatedHtml}
    </code>
  </pre>

)}

  </div>
)}

          <div className="max-w-5xl mx-auto mb-16">

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">

              <h2 className="text-xl font-bold mb-4 text-cyan-400">
                Generation Activity
              </h2>

              <div className="min-h-[120px] text-slate-300 whitespace-pre-wrap leading-relaxed">

                {
                  streamData ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: streamData }}
                    />
                  ) : (
                    "AI response will appear here..."
                  )
                }
                
                

              </div>

            </div>

          </div>

</div>
<div className="max-w-5xl mx-auto mb-16">

  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">

    <h2 className="text-2xl font-bold mb-6 text-indigo-400">
      Project History
    </h2>

    <div className="space-y-3">

      {projects.map((project) => (

        <div
          key={project.id}
          onClick={() => setGeneratedHtml(project.html)}
          className="p-4 rounded-xl border border-slate-700 hover:border-indigo-500 cursor-pointer transition"
        >

          <div className="font-semibold text-white">
            {project.prompt}
          </div>

          <div className="text-sm text-slate-400">
            {project.created_at}
          </div>

        </div>

      ))}

    </div>

  </div>

</div>
        {/* Features / Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: React Client */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">React Client</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Vite dev server running on port 3000. Optimized for sub-second hot module replacement.
            </p>
            <div className="text-xs font-mono text-indigo-400/90 bg-indigo-950/40 px-3 py-2 rounded-lg border border-indigo-900/30">
              cd client && npm run dev
            </div>
          </div>

          {/* Card 2: Express Server */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-5">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">FastAPI Backend</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              FastAPI backend integrated with AWS Bedrock and Amazon Nova Pro.
            </p>
            <div className="text-xs font-mono text-purple-400/90 bg-purple-950/40 px-3 py-2 rounded-lg border border-purple-900/30">
              cd server && npm run dev
            </div>
          </div>

          {/* Card 3: Live Health Check */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">System Status</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">API Gateway:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                  healthStatus === 'connected' ? 'bg-emerald-500/15 text-emerald-400' :
                  healthStatus === 'checking' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {healthStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">API URL:</span>
                <span className="font-mono text-xs text-slate-300">http://127.0.0.1:8000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Message:</span>
                <span className="text-xs text-slate-300 truncate max-w-[120px]">{dbStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Capstone Shery. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
