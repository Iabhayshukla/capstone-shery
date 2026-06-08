import { StreamingFile } from '../types/editor.types';

/**
 * FIXED: CSS aur JS ko HTML se alag NAHI karta.
 * WebContainer sirf index.html likhta hai — agar CSS alag file mein ja
 * to preview mein styling gayab ho jaati hai.
 *
 * Ab sirf ek index.html return hoti hai jisme saari CSS inline rahti hai.
 */
export function parseFilesFromHtml(rawHtml: string): StreamingFile[] {
  // HTML as-is return karo — CSS <style> tags mein safe hain
  return [
    { name: 'index.html', content: rawHtml.trim(), language: 'html' },
  ];
}

/**
 * Agar kabhi truly separate files chahiye hon (e.g. Monaco multi-tab),
 * to yeh helper use karo — lekin WebContainer preview ke liye mat use karna.
 */
export function parseFilesForEditor(rawHtml: string): StreamingFile[] {
  let htmlContent = rawHtml;
  let cssContent = '';
  let jsContent = '';

  // CSS extract
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(rawHtml)) !== null) {
    cssContent += match[1] + '\n';
  }
  htmlContent = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // JS extract (only inline, not src=)
  const scriptRegex = /<script(?![^>]*src\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(rawHtml)) !== null) {
    jsContent += match[1] + '\n';
  }
  htmlContent = htmlContent.replace(/<script(?![^>]*src\s*=)[^>]*>[\s\S]*?<\/script>/gi, '');

  const hasHead = /<\/head>/i.test(htmlContent);
  const hasBody = /<\/body>/i.test(htmlContent);

  const styleLink = cssContent.trim() ? '\n  <link rel="stylesheet" href="styles.css" />' : '';
  const scriptTag = jsContent.trim() ? '\n  <script src="script.js" defer><\/script>' : '';

  if (styleLink) {
    htmlContent = hasHead
      ? htmlContent.replace(/<\/head>/i, `${styleLink}\n</head>`)
      : styleLink + '\n' + htmlContent;
  }

  if (scriptTag) {
    htmlContent = hasBody
      ? htmlContent.replace(/<\/body>/i, `${scriptTag}\n</body>`)
      : htmlContent + '\n' + scriptTag;
  }

  const files: StreamingFile[] = [
    { name: 'index.html', content: htmlContent.trim(), language: 'html' },
  ];

  if (cssContent.trim()) {
    files.push({ name: 'styles.css', content: cssContent.trim(), language: 'css' });
  }

  if (jsContent.trim()) {
    files.push({ name: 'script.js', content: jsContent.trim(), language: 'javascript' });
  }

  return files;
}