export async function mockGenerateHTML(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullHtml: string) => void
): Promise<void> {
  const MOCK_HTML = `
<section data-section-id="hero" style="background:linear-gradient(135deg,#1e1b4b,#2d2a7a,#312e81);padding:60px 40px;text-align:center;">
  <h1 style="font-size:2.5rem;color:#fff;font-weight:800;letter-spacing:-1px;margin-bottom:12px;">${prompt}</h1>
  <p style="font-size:1.1rem;color:#a5b4fc;margin-bottom:24px;">AI-generated · click any section to select and edit it</p>
  <a href="#" style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:10px 28px;font-size:0.95rem;color:#fff;font-weight:600;text-decoration:none;">Get Started →</a>
</section>

<section data-section-id="about" style="padding:48px 32px;background:#f8f7ff;text-align:center;">
  <h2 style="font-size:1.8rem;color:#1e1b4b;font-weight:700;margin-bottom:16px;">About This Project</h2>
  <p style="color:#6366f1;font-size:1rem;max-width:600px;margin:0 auto;">Generated from your prompt: "${prompt}". Click any section to select it and see the glow effect!</p>
</section>

<section data-section-id="features" style="padding:48px 32px;background:#fff;">
  <h2 style="text-align:center;font-size:1.8rem;color:#1e1b4b;font-weight:700;margin-bottom:32px;">Features</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto;">
    <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">⚡</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Fast</h3>
      <p style="color:#6366f1;font-size:0.85rem;">Live preview as you type</p>
    </div>
    <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">🧠</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Smart</h3>
      <p style="color:#6366f1;font-size:0.85rem;">AI powered generation</p>
    </div>
    <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">✏️</div>
      <h3 style="color:#3730a3;font-weight:700;margin-bottom:4px;">Editable</h3>
      <p style="color:#6366f1;font-size:0.85rem;">Click sections to edit</p>
    </div>
  </div>
</section>

<section data-section-id="footer" style="background:#0f172a;padding:32px;text-align:center;">
  <p style="color:#475569;font-size:0.85rem;">Built with ❤️ — Capstone Project 2026</p>
</section>
`.trim();

  const chunkSize = 50;
  let accumulated = '';
  for (let i = 0; i < MOCK_HTML.length; i += chunkSize) {
    await new Promise(res => setTimeout(res, 20));
    accumulated += MOCK_HTML.slice(i, i + chunkSize);
    onChunk(accumulated);
  }
  onDone(accumulated);
}