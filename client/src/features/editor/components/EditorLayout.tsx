import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useEditHistory } from '../hooks/useEditHistory';
import { useGenerate } from '../hooks/useGenerate';
import {
  fetchProjectById,
  updateProject as apiUpdateProject,
} from '@/features/dashboard/api/projects.api';
import type { Project } from '@/features/dashboard/components/ProjectCard';
import WelcomeScreen from './WelcomeScreen';
import StreamingView from './StreamingView';
import PreviewScreen from './PreviewScreen';

interface StreamingFile {
  name: string;
  content: string;
  language: 'html' | 'css' | 'js' | 'jsx' | 'tsx';
}

// ─── Types ──────────────────────────────────────────────────────────────────
type EditorPhase = 'welcome' | 'streaming' | 'preview';

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Build StreamingFile list from generated HTML string
// Backend sends full HTML; we split into logical files for display
function parseFilesFromHtml(rawHtml: string): StreamingFile[] {
  // If backend already sends multi-file JSON, parse here.
  // For now we display as single index.html
  return [
    {
      name: 'index.html',
      content: rawHtml,
      language: 'html',
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function EditorLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { accessToken } = useAuth();

  const { html, push, undo, redo, reset, canUndo, canRedo } = useEditHistory('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const {
    isGenerating,
    streamingHtml,
    error: generateError,
    generate,
  } = useGenerate({
    projectId,
    selectedSection,
    currentHtml: html || null,
  });

  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<EditorPhase>('welcome');
  const [streamingFiles, setStreamingFiles] = useState<StreamingFile[]>([]);
  const [lastPrompt, setLastPrompt] = useState('');

  // ─── Sync streamingHtml → preview files in real time ──────────────────────
  useEffect(() => {
    if (streamingHtml) {
      setStreamingFiles(parseFilesFromHtml(streamingHtml));
    }
  }, [streamingHtml]);

  // Push final HTML into edit history once generation is fully done
  // We watch isGenerating going from true → false and streamingHtml being non-empty
  const wasGenerating = useRef(false);
  useEffect(() => {
    if (wasGenerating.current && !isGenerating && streamingHtml) {
      push(streamingHtml);
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, streamingHtml, push]);

  // ─── Load project ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !projectId) return;
    const load = async () => {
      try {
        const proj = await fetchProjectById(accessToken, projectId);
        setProject(proj);
        if (proj.currentCode) {
          reset(proj.currentCode);
          // If project already has code, skip welcome and go straight to preview
          setStreamingFiles(parseFilesFromHtml(proj.currentCode));
          setPhase('preview');
        }
      } catch (err) {
        console.error('Failed to load project:', err);
      }
    };
    load();
  }, [accessToken, projectId, reset]);

  // ─── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !projectId || !html) return;
    if (project?.currentCode === html) return;

    const timer = setTimeout(async () => {
      try {
        const updated = await apiUpdateProject(accessToken, projectId, { currentCode: html });
        setProject(updated);
        localStorage.setItem('generatedHtml', html);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [html, accessToken, projectId, project]);

  // ─── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async (prompt: string) => {
    setLastPrompt(prompt);
    setStreamingFiles([]);
    setPhase('streaming');

    await generate(prompt);

    // Generation done — streaming phase stays visible.
    // StreamingView shows a "View Preview" button the user clicks to transition.
    setSelectedSection(null);
  }, [generate]);

  // ─── Regenerate (same last prompt, re-run) ─────────────────────────────────
  const handleRegenerate = useCallback(async () => {
    if (!lastPrompt) return;
    setStreamingFiles([]);
    setPhase('streaming');

    await generate(lastPrompt);

    setSelectedSection(null);
  }, [generate, lastPrompt]);

  // ─── Go to preview after streaming ────────────────────────────────────────
  const handleGoToPreview = useCallback(() => {
    setPhase('preview');
  }, []);

  // ─── Code change from Monaco ───────────────────────────────────────────────
  const handleCodeChange = useCallback((newHtml: string) => {
    push(newHtml);
    setStreamingFiles(parseFilesFromHtml(newHtml));
  }, [push]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--brand-dark)' }}>
      <AnimatePresence mode="wait">

        {/* ── WELCOME ── */}
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%' }}
          >
            <WelcomeScreen
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {/* ── STREAMING ── */}
        {phase === 'streaming' && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%', height: '100%' }}
          >
            <StreamingView
              files={streamingFiles}
              isStreaming={isGenerating}
              onPreview={handleGoToPreview}
              error={generateError}
            />
          </motion.div>
        )}

        {/* ── PREVIEW ── */}
        {phase === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%', height: '100%' }}
          >
            <PreviewScreen
              files={streamingFiles}
              html={html}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onGenerate={handleGenerate}
              onCodeChange={handleCodeChange}
              isGenerating={isGenerating}
              lastPrompt={lastPrompt}
              onRegenerate={handleRegenerate}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}