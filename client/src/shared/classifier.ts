/**
 * classifier.ts
 * Keyword Extractor → Classifier Engine → Preview Method Decision
 *
 * Priority order (higher index = higher priority):
 * iframe (static):      default, three/threejs, gsap/animation, chart/graph, bootstrap, tailwind
 * WebContainer (dynamic): react, vue, svelte, next/nextjs, node/express
 */

export type PreviewMethod = 'iframe' | 'webcontainer';

export interface ClassifierResult {
  framework: string;
  previewMethod: PreviewMethod;
  detectedKeywords: string[];
}

// Priority: WebContainer keywords override iframe keywords
const WEBCONTAINER_KEYWORDS: Record<string, string> = {
  react:   'React + Vite',
  vue:     'Vue + Vite',
  svelte:  'Svelte + Vite',
  next:    'Next.js',
  nextjs:  'Next.js',
  'next.js': 'Next.js',
  node:    'Node.js + Express',
  express: 'Node.js + Express',
};

const IFRAME_KEYWORDS: Record<string, string> = {
  three:       'Three.js CDN',
  threejs:     'Three.js CDN',
  'three.js':  'Three.js CDN',
  gsap:        'HTML + GSAP CDN',
  animation:   'HTML + GSAP CDN',
  animate:     'HTML + GSAP CDN',
  chart:       'HTML + Chart.js CDN',
  graph:       'HTML + Chart.js CDN',
  charts:      'HTML + Chart.js CDN',
  bootstrap:   'HTML + Bootstrap CDN',
  tailwind:    'HTML + Tailwind CDN',
};

export function classifyPrompt(prompt: string): ClassifierResult {
  const lower = prompt.toLowerCase();

  // Tokenize: split on spaces, punctuation etc.
  const tokens = lower.split(/[\s,./\\()[\]{}<>:;'"!?@#$%^&*+=|`~-]+/);
  const detected: string[] = [];

  // Check WebContainer first (higher priority)
  for (const token of tokens) {
    if (WEBCONTAINER_KEYWORDS[token]) {
      detected.push(token);
    }
  }
  // Also check multi-word patterns in full string
  for (const key of Object.keys(WEBCONTAINER_KEYWORDS)) {
    if (key.includes('.') && lower.includes(key) && !detected.includes(key)) {
      detected.push(key);
    }
  }

  if (detected.length > 0) {
    // Use the last detected keyword (highest priority / most specific)
    const primary = detected[detected.length - 1];
    return {
      framework: WEBCONTAINER_KEYWORDS[primary],
      previewMethod: 'webcontainer',
      detectedKeywords: detected,
    };
  }

  // Check iframe keywords
  const iframeDetected: string[] = [];
  for (const token of tokens) {
    if (IFRAME_KEYWORDS[token]) {
      iframeDetected.push(token);
    }
  }
  for (const key of Object.keys(IFRAME_KEYWORDS)) {
    if (key.includes('.') && lower.includes(key) && !iframeDetected.includes(key)) {
      iframeDetected.push(key);
    }
  }

  if (iframeDetected.length > 0) {
    const primary = iframeDetected[iframeDetected.length - 1];
    return {
      framework: IFRAME_KEYWORDS[primary],
      previewMethod: 'iframe',
      detectedKeywords: iframeDetected,
    };
  }

  // Default: plain HTML + CSS + JS via iframe
  return {
    framework: 'HTML + CSS + JS',
    previewMethod: 'iframe',
    detectedKeywords: [],
  };
}