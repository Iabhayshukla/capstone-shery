import { useEffect, useRef, useState, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { WebContainerStatus } from '../types/preview.types';

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.5; }

    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .text-center { text-align: center; }

    .text-white { color: #ffffff; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-700 { color: #374151; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-900 { color: #111827; }
    .text-indigo-200 { color: #c7d2fe; }
    .text-indigo-700 { color: #4338ca; }
    .text-green-600 { color: #16a34a; }
    .text-red-600 { color: #dc2626; }
    .text-blue-600 { color: #2563eb; }

    .bg-white { background-color: #ffffff; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-gray-900 { background-color: #111827; }
    .bg-indigo-50 { background-color: #eef2ff; }
    .bg-indigo-600 { background-color: #4f46e5; }
    .bg-indigo-700 { background-color: #4338ca; }
    .bg-blue-600 { background-color: #2563eb; }
    .bg-red-50 { background-color: #fef2f2; }
    .bg-green-50 { background-color: #f0fdf4; }
    .bg-yellow-50 { background-color: #fefce8; }

    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-10 { padding: 2.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .pt-4 { padding-top: 1rem; }
    .pb-4 { padding-bottom: 1rem; }

    .m-0 { margin: 0; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-10 { margin-top: 2.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }

    .flex { display: flex; }
    .grid { display: grid; }
    .block { display: block; }
    .hidden { display: none; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .flex-wrap { flex-wrap: wrap; }

    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

    .w-full { width: 100%; }
    .w-auto { width: auto; }
    .h-full { height: 100%; }
    .h-screen { height: 100vh; }
    .max-w-sm { max-width: 24rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-lg { max-width: 32rem; }
    .max-w-xl { max-width: 36rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-6xl { max-width: 72rem; }

    .border { border-width: 1px; border-style: solid; }
    .border-2 { border-width: 2px; border-style: solid; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-indigo-200 { border-color: #c7d2fe; }
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-full { border-radius: 9999px; }

    .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
    .shadow-xl { box-shadow: 0 20px 25px rgba(0,0,0,0.1); }

    .relative { position: relative; }
    .absolute { position: absolute; }
    .fixed { position: fixed; }
    .sticky { position: sticky; }
    .top-0 { top: 0; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

    .overflow-hidden { overflow: hidden; }
    .overflow-auto { overflow: auto; }
    .cursor-pointer { cursor: pointer; }
    .transition { transition-property: all; transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    .opacity-50 { opacity: 0.5; }
    .opacity-75 { opacity: 0.75; }

    [data-section-id] { cursor: pointer; transition: box-shadow 0.2s ease, outline 0.2s ease; }
    [data-section-id]:hover:not(.section-selected) { outline: 2px dashed rgba(99,102,241,0.6); outline-offset: 0px; }
    [data-section-id].section-selected {
      outline: 2px solid #6366f1;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.3), inset 0 0 20px rgba(99,102,241,0.05);
      animation: sectionGlow 2s ease infinite;
    }
    @keyframes sectionGlow {
      0%,100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.3), inset 0 0 20px rgba(99,102,241,0.05); }
      50% { box-shadow: 0 0 0 4px rgba(99,102,241,0.25), 0 0 35px rgba(99,102,241,0.5), inset 0 0 30px rgba(99,102,241,0.1); }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.onerror = function(msg, src, line) {
      window.parent.postMessage({ type: 'console_error', message: msg + ' (' + src + ':' + line + ')' }, '*');
    };
    document.addEventListener('click', function(e) {
      const target = e.target.closest('[data-section-id]');
      if (target) {
        window.parent.postMessage({
          type: 'section_click',
          sectionId: target.getAttribute('data-section-id')
        }, '*');
      }
    });
    window.addEventListener('message', function(e) {
      document.querySelectorAll('[data-section-id]').forEach(function(el) {
        el.classList.remove('section-selected');
      });
      if (e.data && e.data.type === 'highlight_section' && e.data.sectionId) {
        var target = document.querySelector('[data-section-id="' + e.data.sectionId + '"]');
        if (target) target.classList.add('section-selected');
      }
    });
  </script>
</body>
</html>`;

let globalInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function getWebContainer(): Promise<WebContainer> {
  if (globalInstance) return globalInstance;
  if (bootPromise) return bootPromise;
  bootPromise = WebContainer.boot().then((wc: WebContainer) => {
    globalInstance = wc;
    return wc;
  });
  return bootPromise;
}

export function useWebContainer() {
  const webcontainerRef = useRef<WebContainer | null>(null);
  const [status, setStatus] = useState<WebContainerStatus>({ status: 'idle' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setStatus({ status: 'booting' });
        const wc = await getWebContainer();
        if (cancelled) return;
        webcontainerRef.current = wc;

        await wc.mount({
          'index.html': { file: { contents: INDEX_HTML } },
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'preview',
                scripts: { start: 'serve . -l 3001' },
                dependencies: { serve: 'latest' },
              }),
            },
          },
        });

        setStatus({ status: 'installing' });
        const install = await wc.spawn('npm', ['install']);
        const installCode = await install.exit;
        if (installCode !== 0) throw new Error('npm install failed');

        const server = await wc.spawn('npm', ['start']);
        server.output.pipeTo(new WritableStream({
          write(data) { console.log('[WC]', data); },
        }));

        wc.on('server-ready', (_port: number, url: string) => {
          if (cancelled) return;
          setPreviewUrl(url);
          setStatus({ status: 'ready' });
        });

      } catch (err: any) {
        if (!cancelled) setStatus({ status: 'error', error: err.message });
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  const updateHtml = useCallback(async (html: string) => {
    const wc = webcontainerRef.current;
    if (!wc) return;
    const fullHtml = INDEX_HTML.replace('<div id="root"></div>', html);
    await wc.fs.writeFile('index.html', fullHtml);
  }, []);

  return { status, previewUrl, updateHtml };
}