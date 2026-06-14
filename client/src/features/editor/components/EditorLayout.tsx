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
import type { PreviewMethod } from '@/shared/classifier';

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
  if (html.includes('&lt;') || html.includes('&gt;')) {
    let decoded = html;
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

export default function EditorLayout(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { accessToken } = useAuth();

  const { html, push, undo, redo, reset, canUndo, canRedo } = useEditHistory('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const {
    isGenerating,
    streamingHtml,
    error: generateError,
    generate,
    classification,
  } = useGenerate({
    projectId: projectId || '',
    selectedSection,
    currentHtml: html || null,
  });

  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<EditorPhase>('loading');
  const [streamingFiles, setStreamingFiles] = useState<StreamingFile[]>([]);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const initialCodeRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const generatingSectionRef = useRef<string | null>(null);
  const [previewMethod, setPreviewMethod] = useState<PreviewMethod>('iframe');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    initialCodeRef.current = null;
    setLastPrompt('');
    setMessages([]);
    setPreviewMethod('iframe');
  }, [projectId]);

  useEffect(() => {
    if (streamingHtml) {
      setStreamingFiles(parseFilesFromHtml(streamingHtml));
    }
  }, [streamingHtml]);

  const wasGenerating = useRef<boolean>(false);
  useEffect(() => {
    if (wasGenerating.current && !isGenerating && streamingHtml) {
      push(streamingHtml);
      initialCodeRef.current = streamingHtml;
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
      setMessages((prev: Message[]) => [...prev, aiMsg]);
      generatingSectionRef.current = null;
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, streamingHtml, push, classification]);

  useEffect(() => {
    if (!accessToken || !projectId) return;
    const load = async (): Promise<void> => {
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

  const handleGenerate = useCallback(async (prompt: string): Promise<void> => {
    setLastPrompt(prompt);
    setStreamingFiles([]);
    setPhase('streaming');
    generatingSectionRef.current = selectedSection;
    await generate(prompt);
    setSelectedSection(null);
  }, [generate, selectedSection]);

  const handleRegenerate = useCallback(async (): Promise<void> => {
    if (!lastPrompt) return;
    setStreamingFiles([]);
    setPhase('streaming');
    generatingSectionRef.current = null;
    setMessages((prev: Message[]) => [
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

  const handleGoToPreview = useCallback((): void => {
    setPhase('preview');
  }, []);

  const handleCodeChange = useCallback((newHtml: string): void => {
    push(newHtml);
    setStreamingFiles(parseFilesFromHtml(newHtml));
  }, [push]);

  const handleReset = useCallback((): void => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset the code? All your unsaved changes will be lost."
    );
    if (confirmReset) {
      const targetCode = initialCodeRef.current ?? '';
      reset(targetCode);
      if (targetCode) {
        setStreamingFiles(parseFilesFromHtml(targetCode));
        setPreviewMethod('iframe');
        setPhase('preview');
      } else {
        setStreamingFiles([]);
        setPhase('welcome');
      }
    }
  }, [reset]);

  // Animation variants
  const slideUp = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const isMobile: boolean = windowWidth < 768;
  const isSmallMobile: boolean = windowWidth < 480;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--background)',
        position: 'relative',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div
            key="loading"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? 12 : 16,
              background: 'var(--background)',
              padding: isMobile ? '20px' : '0',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: isMobile ? 40 : 50,
                height: isMobile ? 40 : 50,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid rgba(255, 255, 255, 0.05)',
                  borderTopColor: 'var(--brand-primary)',
                  position: 'absolute',
                }}
              />
              <motion.div
                animate={{ scale: [0.85, 1.05, 0.85] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                }}
              >
                <Sparkles size={isMobile ? 14 : 18} />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: isMobile ? 9 : 11,
                letterSpacing: isMobile ? 1.5 : 2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: isMobile ? '0 16px' : '0',
              }}
            >
              {isSmallMobile ? 'Loading...' : 'Loading workspace...'}
            </motion.p>
          </motion.div>
        )}

        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            variants={slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <WelcomeScreen onGenerate={handleGenerate} isGenerating={isGenerating} />
          </motion.div>
        )}

        {phase === 'streaming' && (
          <motion.div
            key="streaming"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <StreamingView
              files={streamingFiles}
              isStreaming={isGenerating}
              onPreview={handleGoToPreview}
              error={generateError}
            />
          </motion.div>
        )}

        {phase === 'preview' && (
          <motion.div
            key="preview"
            variants={slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, delay: 0.05 }}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
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
              projectId={projectId || ''}
              onReset={handleReset}
              messages={messages}
              setMessages={setMessages}
              previewMethod={previewMethod}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}