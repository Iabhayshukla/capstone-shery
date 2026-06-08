import { useEffect, useRef, useState, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { WebContainerStatus } from '../types/preview.types';

// Base HTML template — sirf skeleton, actual content updateHtml se aata hai
const BASE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--
    IMPORTANT: Yahan koi hardcoded CSS nahi — AI-generated HTML mein
    apni <style> tags hoti hain jo inline inject hoti hain.
    Isse CSS kabhi missing nahi hoti.
  -->

  <!--
    CSP: External images (Unsplash, Pexels, CDNs) allow karo.
    img-src * allows all external image sources.
  -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
                 img-src * data: blob:;
                 font-src * data:;
                 style-src * 'unsafe-inline';
                 script-src * 'unsafe-inline' 'unsafe-eval';" />

  <style>
    /* Section highlight styles — yeh hamesha chahiye */
    [data-section-id] {
      cursor: pointer;
      transition: box-shadow 0.2s ease, outline 0.2s ease;
    }
    [data-section-id]:hover:not(.section-selected) {
      outline: 2px dashed rgba(99,102,241,0.6);
      outline-offset: 0px;
    }
    [data-section-id].section-selected {
      outline: 2px solid #6366f1;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15),
                  0 0 20px rgba(99,102,241,0.3),
                  inset 0 0 20px rgba(99,102,241,0.05);
      animation: sectionGlow 2s ease infinite;
    }
    @keyframes sectionGlow {
      0%,100% {
        box-shadow: 0 0 0 4px rgba(99,102,241,0.15),
                    0 0 20px rgba(99,102,241,0.3),
                    inset 0 0 20px rgba(99,102,241,0.05);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(99,102,241,0.25),
                    0 0 35px rgba(99,102,241,0.5),
                    inset 0 0 30px rgba(99,102,241,0.1);
      }
    }
  </style>
</head>
<body>
  <div id="__preview_root__"></div>

  <script>
    // Error reporting to parent
    window.onerror = function(msg, src, line) {
      window.parent.postMessage(
        { type: 'console_error', message: msg + ' (' + src + ':' + line + ')' },
        '*'
      );
    };

    // Section click bridge
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-section-id]');
      if (target) {
        window.parent.postMessage({
          type: 'section_click',
          sectionId: target.getAttribute('data-section-id')
        }, '*');
      }
    });

    // Section highlight from parent
    window.addEventListener('message', function(e) {
      document.querySelectorAll('[data-section-id]').forEach(function(el) {
        el.classList.remove('section-selected');
      });
      if (e.data && e.data.type === 'highlight_section' && e.data.sectionId) {
        var t = document.querySelector('[data-section-id="' + e.data.sectionId + '"]');
        if (t) t.classList.add('section-selected');
      }
    });
  <\/script>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// EAGER BOOT — module import hote hi WebContainer start ho jaata hai
// ─────────────────────────────────────────────────────────────────────────────

let globalInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

type StatusListener = (s: WebContainerStatus) => void;
const statusListeners = new Set<StatusListener>();
let sharedStatus: WebContainerStatus = { status: 'booting' };
let sharedPreviewUrl: string | null = null;

function emitStatus(s: WebContainerStatus) {
  sharedStatus = s;
  statusListeners.forEach((fn) => fn(s));
}

function startEagerBoot() {
  if (bootPromise) return;

  bootPromise = WebContainer.boot().then(async (wc: WebContainer) => {
    globalInstance = wc;

    // Mount karo — sirf base template, content baad mein updateHtml se aayega
    await wc.mount({
      'index.html': { file: { contents: BASE_TEMPLATE } },
      'package.json': {
        file: {
          contents: JSON.stringify({
            name: 'preview',
            scripts: { start: 'serve . -l 3001 --cors' }, // --cors: external resources allow
            dependencies: { serve: 'latest' },
          }),
        },
      },
    });

    emitStatus({ status: 'installing' });
    const install = await wc.spawn('npm', ['install']);
    const installCode = await install.exit;
    if (installCode !== 0) throw new Error('npm install failed');

    const server = await wc.spawn('npm', ['start']);
    server.output.pipeTo(
      new WritableStream({ write(data) { console.log('[WC]', data); } })
    );

    wc.on('server-ready', (_port: number, url: string) => {
      sharedPreviewUrl = url;
      emitStatus({ status: 'ready' });
    });

    return wc;
  }).catch((err: Error) => {
    emitStatus({ status: 'error', error: err.message });
    throw err;
  });
}

startEagerBoot();

// ─────────────────────────────────────────────────────────────────────────────

export function useWebContainer() {
  const webcontainerRef = useRef<WebContainer | null>(globalInstance);
  const [status, setStatus] = useState<WebContainerStatus>(sharedStatus);
  const [previewUrl, setPreviewUrl] = useState<string | null>(sharedPreviewUrl);

  useEffect(() => {
    const listener: StatusListener = (s) => {
      setStatus(s);
      if (s.status === 'ready') {
        setPreviewUrl(sharedPreviewUrl);
        webcontainerRef.current = globalInstance;
      }
    };
    statusListeners.add(listener);

    // Sync karo agar boot pehle se complete ho chuka ho
    setStatus(sharedStatus);
    setPreviewUrl(sharedPreviewUrl);
    if (globalInstance) webcontainerRef.current = globalInstance;

    return () => { statusListeners.delete(listener); };
  }, []);

  /**
   * FIXED updateHtml:
   * Ab AI-generated HTML ko as-is inject karta hai — CSS, external images,
   * fonts sab kuch preserve hota hai.
   *
   * Strategy:
   * - Agar full HTML document hai (<html> tag hai) → directly use karo,
   *   sirf section scripts inject karo
   * - Agar partial HTML hai → BASE_TEMPLATE mein inject karo
   */
  const updateHtml = useCallback(async (html: string) => {
    const wc = webcontainerRef.current ?? globalInstance;
    if (!wc) return;

    let finalHtml: string;

    const isFullDocument = /<html[\s>]/i.test(html);

    if (isFullDocument) {
      // Full document — section highlight styles inject karo agar nahi hain
      const hasStyles = /section-selected/.test(html);
      if (!hasStyles) {
        const sectionStyles = `
  <style>
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
  </style>`;

        // <head> mein inject karo
        if (/<\/head>/i.test(html)) {
          finalHtml = html.replace(/<\/head>/i, `${sectionStyles}\n</head>`);
        } else if (/<head>/i.test(html)) {
          finalHtml = html.replace(/<head>/i, `<head>${sectionStyles}`);
        } else {
          finalHtml = html;
        }
      } else {
        finalHtml = html;
      }

      // Bridge script inject karo (section click + error reporting)
      const hasBridge = /section_click/.test(finalHtml);
      if (!hasBridge) {
        const bridgeScript = `
  <script>
    window.onerror = function(msg, src, line) {
      window.parent.postMessage({ type: 'console_error', message: msg + ' (' + src + ':' + line + ')' }, '*');
    };
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-section-id]');
      if (target) window.parent.postMessage({ type: 'section_click', sectionId: target.getAttribute('data-section-id') }, '*');
    });
    window.addEventListener('message', function(e) {
      document.querySelectorAll('[data-section-id]').forEach(function(el) { el.classList.remove('section-selected'); });
      if (e.data && e.data.type === 'highlight_section' && e.data.sectionId) {
        var t = document.querySelector('[data-section-id="' + e.data.sectionId + '"]');
        if (t) t.classList.add('section-selected');
      }
    });
  <\/script>`;

        if (/<\/body>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<\/body>/i, `${bridgeScript}\n</body>`);
        } else {
          finalHtml = finalHtml + bridgeScript;
        }
      }

      // CSP meta inject karo agar nahi hai (external images ke liye)
      const hasCsp = /Content-Security-Policy/i.test(finalHtml);
      if (!hasCsp) {
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; font-src * data:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval';" />`;
        if (/<head>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<head>/i, `<head>\n  ${cspMeta}`);
        }
      }
    } else {
      // Partial HTML — BASE_TEMPLATE ke root div mein inject karo
      finalHtml = BASE_TEMPLATE.replace(
        '<div id="__preview_root__"></div>',
        `<div id="__preview_root__">${html}</div>`
      );
    }

    await wc.fs.writeFile('index.html', finalHtml);
  }, []);

  return { status, previewUrl, updateHtml };
}