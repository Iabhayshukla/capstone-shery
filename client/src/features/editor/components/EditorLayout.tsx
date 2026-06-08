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
import { Sparkles } from 'lucide-react';
import type { Message } from './PromptPanel';
import type { PreviewMethod } from '@/shared/classifier'; // ✅ ADDED

interface StreamingFile {
  name: string;
  content: string;
  language: string;
}

type EditorPhase = 'loading' | 'welcome' | 'streaming' | 'preview';

function parseFilesFromHtml(rawHtml: string): StreamingFile[] {
  return [
    {
      name: 'index.html',
      content: rawHtml,
      language: 'html',
    },
  ];
}

function decodeEscapedHtml(html: string): string {
  if (!html) return html;
  // Check if it is HTML-entity escaped
  if (html.includes('&lt;') || html.includes('&gt;')) {
    let decoded = html;
    // Replace JSON-escaped newlines and double quotes if they exist
    if (decoded.includes('\\n') || decoded.includes('\\"')) {
      decoded = decoded
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
    }
    return decoded
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }
  return html;
}

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
    classification, // ✅ ADDED — classifier result se previewMethod milega
  } = useGenerate({
    projectId,
    selectedSection,
    currentHtml: html || null,
  });

  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<EditorPhase>('loading');
  const [streamingFiles, setStreamingFiles] = useState<StreamingFile[]>([]);
  const [lastPrompt, setLastPrompt] = useState('');
  const initialCodeRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const generatingSectionRef = useRef<string | null>(null);

  // ✅ ADDED — previewMethod state: generate hone ke baad set hota hai, project load pe 'iframe' rehta hai
  const [previewMethod, setPreviewMethod] = useState<PreviewMethod>('iframe');

  // Reset session state when projectId changes
  useEffect(() => {
    initialCodeRef.current = null;
    setLastPrompt('');
    setMessages([]);
    setPreviewMethod('iframe'); // ✅ project change pe reset
  }, [projectId]);

  // Sync streamingHtml → preview files in real time
  useEffect(() => {
    if (streamingHtml) {
      setStreamingFiles(parseFilesFromHtml(streamingHtml));
    }
  }, [streamingHtml]);

  // Push final HTML into edit history once generation is fully done
  const wasGenerating = useRef(false);
  useEffect(() => {
    if (wasGenerating.current && !isGenerating && streamingHtml) {
      push(streamingHtml);
      initialCodeRef.current = streamingHtml;

      // ✅ ADDED — generation complete hone ke baad classification se previewMethod set karo
      if (classification?.previewMethod) {
        setPreviewMethod(classification.previewMethod);
      }

      const targetSec = generatingSectionRef.current;
      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: targetSec
          ? `Updated the "${targetSec}" section! Check the preview.`
          : 'Website generated! Check the preview. Click any section to select and edit it.',
      };
      setMessages(prev => [...prev, aiMsg]);
      generatingSectionRef.current = null;
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, streamingHtml, push, classification]);

  // Load project
  useEffect(() => {
    if (!accessToken || !projectId) return;
    const load = async () => {
      try {
        const proj = await fetchProjectById(accessToken, projectId);
        if (proj.currentCode) {
          proj.currentCode = decodeEscapedHtml(proj.currentCode);
        }
        setProject(proj);
        if (proj.currentCode) {
          if (initialCodeRef.current === null) {
            initialCodeRef.current = proj.currentCode;
          }
          reset(proj.currentCode);
          setStreamingFiles(parseFilesFromHtml(proj.currentCode));
          // ✅ Saved project ka code hamesha iframe se load hoga — safe default
          setPreviewMethod('iframe');
          setPhase('preview');
        } else {
          if (initialCodeRef.current === null) {
            initialCodeRef.current = '';
          }
          setPhase('welcome');
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setPhase('welcome');
      }
    };
    load();
  }, [accessToken, projectId, reset]);

  // Auto-save
  useEffect(() => {
    if (!accessToken || !projectId || phase === 'loading') return;

    const dbCode = project?.currentCode || '';
    if (dbCode === html) return;

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
  }, [html, accessToken, projectId, project, phase]);

  // Generate
  const handleGenerate = useCallback(async (prompt: string) => {
    setLastPrompt(prompt);
    setStreamingFiles([]);
    setPhase('streaming');
    generatingSectionRef.current = selectedSection;

    await generate(prompt);

    setSelectedSection(null);
  }, [generate, selectedSection]);

  // Regenerate
  const handleRegenerate = useCallback(async () => {
    if (!lastPrompt) return;
    setStreamingFiles([]);
    setPhase('streaming');
    generatingSectionRef.current = null;

    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: 'Regenerate',
      },
    ]);

    await generate(lastPrompt);
    setSelectedSection(null);
  }, [generate, lastPrompt]);

  // Go to preview after streaming
  const handleGoToPreview = useCallback(() => {
    setPhase('preview');
  }, []);

  // Code change from Monaco
  const handleCodeChange = useCallback((newHtml: string) => {
    push(newHtml);
    setStreamingFiles(parseFilesFromHtml(newHtml));
  }, [push]);

  // Reset code
  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset the code? All your unsaved changes will be lost.")) {
      const targetCode = initialCodeRef.current ?? '';
      reset(targetCode);
      if (targetCode) {
        setStreamingFiles(parseFilesFromHtml(targetCode));
        setPreviewMethod('iframe'); // ✅ reset pe iframe mode
        setPhase('preview');
      } else {
        setStreamingFiles([]);
        setPhase('welcome');
      }
    }
  }, [reset]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--brand-dark)' }}>
      <AnimatePresence mode="wait">

        {/* LOADING */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16, background: 'var(--brand-dark)',
            }}
          >
            <div style={{ position: 'relative', width: 50, height: 50 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                style={{
                  width: '100%', height: '100%',
                  borderRadius: '50%',
                  border: '3px solid rgba(255, 255, 255, 0.05)',
                  borderTopColor: '#D4FF57',
                  position: 'absolute',
                }}
              />
              <motion.div
                animate={{ scale: [0.85, 1.05, 0.85] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#D4FF57',
                }}
              >
                <Sparkles size={18} />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 11, letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(240, 237, 230, 0.6)',
              }}
            >
              Loading workspace...
            </motion.p>
          </motion.div>
        )}

        {/* WELCOME */}
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ width: '100%', height: '100%' }}
          >
            <WelcomeScreen
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {/* STREAMING */}
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

        {/* PREVIEW */}
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
              projectId={projectId}
              onReset={handleReset}
              messages={messages}
              setMessages={setMessages}
              previewMethod={previewMethod} // ✅ ADDED — classifier result pass ho raha hai
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}