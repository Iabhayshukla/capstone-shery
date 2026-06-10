"""
website_prompt.py – Optimized prompt builders for AWS Bedrock Nova Pro.
Includes chain‑of‑thought, few‑shot examples, and strict quality rules.
"""

# ─────────────────────────────────────────────────────────────────────────────
# SHARED RULES (enhanced)
# ─────────────────────────────────────────────────────────────────────────────

STRICT_OUTPUT = """\
CRITICAL OUTPUT FORMAT – FOLLOW EXACTLY:
- Your entire response must be ONLY the code.
- The very first character must be the first character of the code (e.g., `<` for HTML).
- The very last character must be the last character of the code.
- NO markdown, NO code fences, NO explanations, NO greetings.
- NO extra text before or after the code.
"""

NO_CDN_RULES = """\
ZERO EXTERNAL RESOURCES:
- NO CDN links of any kind. No <script src="http...">, no <link href="http...">.
- NO @import url() pointing to external domains.
- NO external images or fonts. Use system fonts and inline SVG/CSS shapes instead.
- ALL styles inside <style>, ALL scripts inside <script>.
"""

NO_TAILWIND_RULES = """\
NO TAILWIND CLASS NAMES:
- Do NOT use Tailwind utility classes (bg-*, text-*, flex, grid, mt-*, p-*, rounded-*, etc.).
- Use your own descriptive class names and write actual CSS.
"""

QUALITY_BAR = """\
VISUAL QUALITY (non‑negotiable):
- System font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- Premium SaaS aesthetic: gradient text, glassmorphism, subtle shadows, smooth animations.
- Realistic marketing copy – NO "lorem ipsum", NO "placeholder image". Write actual product names, benefits, and testimonials.
- Fully responsive (mobile-first), using CSS Grid/Flexbox, media queries at 768px and 1024px.
- Every interactive element (button, card, link) must have a hover transition (scale, shadow, or color change).
- All sections must have entrance animations (fade-up on scroll) using IntersectionObserver or CSS @keyframes.
"""

DESIGN_TOKENS = """\
USE THESE CSS VARIABLES IN :root:
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --accent: #f59e0b;
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-2: #242424;
  --border: rgba(255,255,255,0.08);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
"""

MANDATORY_SECTIONS_HTML = """\
MANDATORY SECTIONS (in this exact order, each with the given data-section-id):
1. <header data-section-id="navbar">  – sticky nav, logo, 4–5 links, CTA button
2. <section data-section-id="hero">   – large headline, subtitle, two buttons, gradient background, entrance animation
3. <section data-section-id="features"> – exactly 6 feature cards in a 3×2 grid (glassmorphism)
4. <section data-section-id="benefits"> – exactly 4 benefit cards with icons (use CSS shapes or emoji)
5. <section data-section-id="testimonials"> – exactly 3 testimonial cards (photo placeholder as SVG circle, quote, name, title)
6. <section data-section-id="faq">    – exactly 5 FAQ items using <details><summary> (no JS needed)
7. <section data-section-id="contact"> – simple form (name, email, message) + submit button that shows alert("Message sent!")
8. <footer data-section-id="footer">  – 3–4 columns, links, copyright, social icons (inline SVG)
"""

CHAIN_OF_THOUGHT = """\
BEFORE WRITING CODE, PLAN IN YOUR HEAD:
1. Understand the user's request: what type of website? (SaaS, portfolio, e‑commerce, blog?)
2. Choose a color scheme (modern, high contrast, accessible).
3. Plan the layout: hero → features → benefits → testimonials → FAQ → contact → footer.
4. Write the HTML structure first, then CSS (using the design tokens above), then minimal JS for interactivity.
5. Ensure every section has a data-section-id and realistic, compelling copy (no placeholders).
"""

FEW_SHOT_HERO = """\
EXAMPLE OF A PERFECT HERO SECTION (follow this style):
<section data-section-id="hero" class="hero">
  <div class="hero-content">
    <h1>Build AI Websites <span class="gradient">in Minutes</span></h1>
    <p>Generate production‑ready code with a single prompt. No coding required.</p>
    <div class="hero-buttons">
      <button class="btn-primary">Get Started →</button>
      <button class="btn-secondary">Watch Demo</button>
    </div>
  </div>
</section>
CSS for that hero: gradient text, glassmorphism button, hover scale effect, fade-up animation.
"""

SECTION_EDITING_NOTE = """\
SECTION EDITING MODE (when sectionId is given):
- Keep ALL other sections EXACTLY as they were.
- Only replace the section with the matching data-section-id.
- Output the COMPLETE page, not just the edited section.
"""

# ─────────────────────────────────────────────────────────────────────────────
# DEFAULT HTML + CSS + JS (iframe)
# ─────────────────────────────────────────────────────────────────────────────

def build_default_prompt(user_prompt: str) -> str:
    return f"""\
Generate a complete, self-contained HTML page.

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{FEW_SHOT_HERO}
{MANDATORY_SECTIONS_HTML}
{QUALITY_BAR}
{DESIGN_TOKENS}

ADDITIONAL REQUIREMENTS:
- Hero: gradient text (background-clip: text) and a subtle animated gradient background.
- Feature cards: glassmorphism (background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1)).
- FAQ: use <details> with a subtle open/close animation (details[open] selector).
- Form: prevent default submit with e.preventDefault() and show alert("Message sent!").
- Include a CSS @keyframes pulse animation for the CTA button.
- Use IntersectionObserver in a <script> at the end to add a "visible" class to elements when they enter the viewport (for fade‑up effects).
- Navbar: transparent on hero, solid background when scrolled (use IntersectionObserver).
- No placeholder text – write realistic copy: e.g., "Boost conversions by 40%", "Join 10,000+ happy customers".

REMEMBER: Output ONLY the raw HTML. First character must be `<`. No markdown, no CDN, no Tailwind classes.
"""

# ─────────────────────────────────────────────────────────────────────────────
# THREE.JS – raw WebGL / Canvas 2D, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_threejs_prompt(user_prompt: str) -> str:
    return f"""\
Create a single HTML file with an interactive 3D scene using only browser built‑in APIs (WebGL or Canvas 2D with 3D math).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

REQUIREMENTS:
- Full viewport canvas (width:100vw; height:100vh; margin:0; overflow:hidden).
- Animation loop using requestAnimationFrame.
- Mouse/touch interactivity (rotate, zoom).
- All geometry generated programmatically – no external assets.
- Smooth 60fps performance.
- Use realistic colors and lighting (no placeholder colors).

REMEMBER: Output ONLY raw HTML. No CDN, no markdown, no extra text.
"""

# ─────────────────────────────────────────────────────────────────────────────
# GSAP / ANIMATION – native CSS/JS, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_gsap_prompt(user_prompt: str) -> str:
    return f"""\
Build a visually stunning animated web page using only native CSS and JavaScript (no GSAP CDN).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{FEW_SHOT_HERO}
{MANDATORY_SECTIONS_HTML}
{QUALITY_BAR}
{DESIGN_TOKENS}

REQUIREMENTS:
- Use CSS @keyframes, transitions, IntersectionObserver, and the Web Animations API.
- Every major section must have an entrance animation (fade‑up on scroll).
- Hero must have a dramatic entrance animation (e.g., scale + fade).
- All styles in a <style> tag, all scripts in a <script> tag.
- System fonts only, realistic copy.

REMEMBER: Output ONLY raw HTML. No CDN, no markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# CHART / GRAPH – inline SVG / Canvas 2D, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_chart_prompt(user_prompt: str) -> str:
    return f"""\
Create a data dashboard using only inline SVG and Canvas 2D (no Chart.js CDN).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

REQUIREMENTS:
- Use inline SVG (<rect>, <polyline>, <circle>, etc.) or Canvas 2D for charts.
- Include bar, line, and pie/doughnut charts with realistic mock data (e.g., sales figures, user growth).
- Add KPI cards with trend indicators (up/down arrows using SVG).
- All CSS in a <style> tag, system fonts only.
- No placeholder text – use real‑looking data labels.

REMEMBER: Output ONLY raw HTML. No CDN, no markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# BOOTSTRAP – hand‑written grid, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_bootstrap_prompt(user_prompt: str) -> str:
    return f"""\
Build a responsive HTML page with a custom CSS grid framework (no Bootstrap CDN).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{MANDATORY_SECTIONS_HTML}
{QUALITY_BAR}
{DESIGN_TOKENS}

REQUIREMENTS:
- Write your own .container, .row, .col, .flex, .items-center utility classes.
- All CSS in a <style> tag.
- System fonts only.
- Fully responsive with media queries.
- Realistic copy, no placeholders.

REMEMBER: Output ONLY raw HTML. No CDN, no markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# TAILWIND – hand‑written custom CSS, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_tailwind_prompt(user_prompt: str) -> str:
    return f"""\
Generate a beautifully styled HTML page with custom CSS (no Tailwind CDN).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{MANDATORY_SECTIONS_HTML}
{QUALITY_BAR}
{DESIGN_TOKENS}

REQUIREMENTS:
- Write all styles in a <style> tag using descriptive class names.
- No Tailwind utility classes whatsoever.
- System fonts only.
- All interactive elements have hover transitions.
- Realistic copy – no lorem ipsum.

REMEMBER: Output ONLY raw HTML. No CDN, no markdown, no Tailwind classes.
"""

# ─────────────────────────────────────────────────────────────────────────────
# REACT – WebContainer
# ─────────────────────────────────────────────────────────────────────────────

def build_react_prompt(user_prompt: str) -> str:
    return f"""\
Create a React application component (App.jsx) that runs in a browser‑only environment.

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

FORMAT:
- Output a single App.jsx file. First character must be `i` (import).
- Use React hooks (useState, useEffect, etc.).
- Inject CSS via a <style> tag appended to document.head inside useEffect.
- All child components defined in the same file.
- Export default the App component.
- No external packages except React.
- Realistic content, no placeholders.

REMEMBER: Output ONLY the JSX code. No markdown, no explanations.
"""

# ─────────────────────────────────────────────────────────────────────────────
# VUE – WebContainer
# ─────────────────────────────────────────────────────────────────────────────

def build_vue_prompt(user_prompt: str) -> str:
    return f"""\
Create a Vue 3 single‑file component (App.vue).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

FORMAT:
- Single file with <template>, <script setup>, and <style scoped>.
- Use Composition API (ref, computed, onMounted).
- No external packages except Vue.
- Realistic copy.

REMEMBER: Output ONLY the Vue SFC code. No markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# SVELTE – WebContainer
# ─────────────────────────────────────────────────────────────────────────────

def build_svelte_prompt(user_prompt: str) -> str:
    return f"""\
Create a Svelte component (App.svelte).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

FORMAT:
- Single file with <script>, markup, and <style>.
- Use Svelte reactivity ($:, stores, lifecycle hooks).
- No external packages except Svelte.
- Realistic content.

REMEMBER: Output ONLY the Svelte code. No markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# NEXT.JS – WebContainer
# ─────────────────────────────────────────────────────────────────────────────

def build_next_prompt(user_prompt: str) -> str:
    return f"""\
Create a Next.js page component (pages/index.jsx).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

FORMAT:
- Use Next.js conventions (Link, useRouter).
- Style with pure CSS-in-JS or <style jsx>.
- No external packages except Next.js.
- Realistic copy, no placeholders.

REMEMBER: Output ONLY the JSX code. No markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# NODE / EXPRESS – WebContainer
# ─────────────────────────────────────────────────────────────────────────────

def build_node_prompt(user_prompt: str) -> str:
    return f"""\
Create a Node.js Express server (server.js).

USER REQUEST: {user_prompt}

{STRICT_OUTPUT}
{NO_CDN_RULES}
{NO_TAILWIND_RULES}
{CHAIN_OF_THOUGHT}
{QUALITY_BAR}

FORMAT:
- ES modules syntax (import/export).
- Serve a beautiful HTML frontend from GET / using res.send() with inline CSS (no CDN).
- Include mock REST API endpoints (GET, POST) with JSON data.
- No external packages except express.
- The HTML served must be a complete, modern landing page (no placeholders).

REMEMBER: Output ONLY the Node.js code. No markdown.
"""

# ─────────────────────────────────────────────────────────────────────────────
# SELECTOR (unchanged, but now all prompts are enhanced)
# ─────────────────────────────────────────────────────────────────────────────

def build_website_prompt(user_prompt: str, framework: str = "") -> str:
    f = (framework or "").lower()

    if "three" in f:
        return build_threejs_prompt(user_prompt)
    if "gsap" in f:
        return build_gsap_prompt(user_prompt)
    if "chart" in f:
        return build_chart_prompt(user_prompt)
    if "bootstrap" in f:
        return build_bootstrap_prompt(user_prompt)
    if "tailwind" in f:
        return build_tailwind_prompt(user_prompt)
    if "react" in f:
        return build_react_prompt(user_prompt)
    if "vue" in f:
        return build_vue_prompt(user_prompt)
    if "svelte" in f:
        return build_svelte_prompt(user_prompt)
    if "next" in f:
        return build_next_prompt(user_prompt)
    if "node" in f or "express" in f:
        return build_node_prompt(user_prompt)

    return build_default_prompt(user_prompt)