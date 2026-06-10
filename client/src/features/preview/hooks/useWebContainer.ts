import { useEffect, useRef, useState, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { WebContainerStatus } from '../types/preview.types';

const BASE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base target="_self" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
                 img-src * data: blob:;
                 font-src * data:;
                 style-src * 'unsafe-inline';
                 script-src * 'unsafe-inline' 'unsafe-eval';" />
  <style>
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
    // window.location block
    try {
      Object.defineProperty(window, 'location', {
        get: function() {
          return {
            assign: function() {},
            replace: function() {},
            reload: function() {},
            href: '',
            toString: function() { return ''; }
          };
        },
        configurable: true
      });
    } catch(e) {}

    // window.open block
    window.open = function() { return null; };

    // Error reporting
    window.onerror = function(msg, src, line) {
      window.parent.postMessage(
        { type: 'console_error', message: msg + ' (' + src + ':' + line + ')' },
        '*'
      );
    };

    // Link + form block + section click
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      var submitBtn = e.target.closest('button[type="submit"]');
      if (submitBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      var target = e.target.closest('[data-section-id]');
      if (target) {
        window.parent.postMessage({
          type: 'section_click',
          sectionId: target.getAttribute('data-section-id')
        }, '*');
      }
    }, true);

    // Form submit block
    document.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, true);

    // Section highlight
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

// ─── Eager Boot ───────────────────────────────────────────────────────────────

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

    await wc.mount({
      'index.html': { file: { contents: BASE_TEMPLATE } },
      'package.json': {
        file: {
          contents: JSON.stringify({
            name: 'preview',
            scripts: { start: 'serve . -l 3001 --cors' },
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

// ─── Constants ────────────────────────────────────────────────────────────────

const BRIDGE_SCRIPT = `
  <script>
    // window.location block
    try {
      Object.defineProperty(window, 'location', {
        get: function() {
          return {
            assign: function() {},
            replace: function() {},
            reload: function() {},
            href: '',
            toString: function() { return ''; }
          };
        },
        configurable: true
      });
    } catch(e) {}

    // window.open block
    window.open = function() { return null; };

    // Error reporting
    window.onerror = function(msg, src, line) {
      window.parent.postMessage({ type: 'console_error', message: msg + ' (' + src + ':' + line + ')' }, '*');
    };

    // Link + form block + section click
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      var submitBtn = e.target.closest('button[type="submit"]');
      if (submitBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      var target = e.target.closest('[data-section-id]');
      if (target) {
        window.parent.postMessage({
          type: 'section_click',
          sectionId: target.getAttribute('data-section-id')
        }, '*');
      }
    }, true);

    document.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, true);

    window.addEventListener('message', function(e) {
      document.querySelectorAll('[data-section-id]').forEach(function(el) {
        el.classList.remove('section-selected');
      });
      if (e.data && e.data.type === 'highlight_section' && e.data.sectionId) {
        var t = document.querySelector('[data-section-id="' + e.data.sectionId + '"]');
        if (t) t.classList.add('section-selected');
      }
    });
  <\/script>`;

const SECTION_STYLES = `
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

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; font-src * data:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval';" />`;

const BASE_META = `<base target="_self" />`;

// ─── Hook ─────────────────────────────────────────────────────────────────────

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

    setStatus(sharedStatus);
    setPreviewUrl(sharedPreviewUrl);
    if (globalInstance) webcontainerRef.current = globalInstance;

    return () => { statusListeners.delete(listener); };
  }, []);

  const updateHtml = useCallback(async (html: string) => {
    const wc = webcontainerRef.current ?? globalInstance;
    if (!wc) return;

    let finalHtml: string;
    const isFullDocument = /<html[\s>]/i.test(html);

    if (isFullDocument) {
      finalHtml = html;

      // Base meta inject
      if (!/<base/i.test(finalHtml)) {
        if (/<head>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<head>/i, `<head>\n  ${BASE_META}`);
        }
      }

      // CSP meta inject
      if (!/Content-Security-Policy/i.test(finalHtml)) {
        if (/<head>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<head>/i, `<head>\n  ${CSP_META}`);
        }
      }

      // Section styles inject
      if (!/section-selected/.test(finalHtml)) {
        if (/<\/head>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<\/head>/i, `${SECTION_STYLES}\n</head>`);
        } else if (/<head>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<head>/i, `<head>${SECTION_STYLES}`);
        }
      }

      // Bridge script inject
      if (!/section_click/.test(finalHtml)) {
        if (/<\/body>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/<\/body>/i, `${BRIDGE_SCRIPT}\n</body>`);
        } else {
          finalHtml = finalHtml + BRIDGE_SCRIPT;
        }
      }

    } else {
      // Partial HTML
      finalHtml = BASE_TEMPLATE.replace(
        '<div id="__preview_root__"></div>',
        `<div id="__preview_root__">${html}</div>`
      );
    }

    await wc.fs.writeFile('index.html', finalHtml);
  }, []);

  return { status, previewUrl, updateHtml };
}