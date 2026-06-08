"""
website_prompt.py
Framework-aware prompt builder for AWS Bedrock Nova Pro.
The framework string comes from the frontend classifier via the API request body.
"""

BASE_RULES = """
STRICT OUTPUT RULES:
- Return ONLY raw code. No markdown. No code fences. No explanations.
- The very first character must be the opening tag/token of the output file.
- No external images, no local image files (no hero.jpg, banner.jpg, logo.png).
- Every major section must have a unique data-section-id attribute for section editing.

SECTION EDITING MODE:
When a sectionId is provided, keep ALL other sections EXACTLY as-is.
Only regenerate the section with the matching data-section-id.
Return the COMPLETE page with the edited section merged in.

CRITICAL — ZERO CDN ALLOWED:
Do NOT use ANY of the following under ANY circumstances:
- cdn.tailwindcss.com, unpkg.com, jsdelivr.net, cdnjs.cloudflare.com
- fonts.googleapis.com, fonts.gstatic.com, use.fontawesome.com
- skypack.dev, esm.sh, esm.run, ga.jspm.io
- Three.js CDN, GSAP CDN, Chart.js CDN, Bootstrap CDN, Alpine.js CDN
- ANY <script src="http..."> or <link href="http...">
- ANY @import url() pointing to an external domain
Write ALL styles inside <style>. Write ALL scripts inside <script>. No exceptions.

CRITICAL — NO TAILWIND CLASS NAMES:
Do NOT use Tailwind utility classes in HTML attributes.
- BANNED: class="bg-gray-50 text-white mt-8 flex items-center px-4 rounded-lg font-inter ..."
- BANNED: Any class that is a Tailwind utility (bg-*, text-*, mt-*, p-*, flex, grid, rounded-*, etc.)
- CORRECT: Write actual CSS properties inside <style> and use your own descriptive class names.
- Example: Instead of class="mt-8 bg-blue-500", write .btn { margin-top: 2rem; background: #3b82f6; }
"""

QUALITY_BAR = """
QUALITY BAR:
Every page should look like it was designed by a senior product designer at a top tech company.
- Use system fonts: font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
- Gradient text, gradient backgrounds, glassmorphism effects
- Subtle animations with CSS @keyframes and transitions
- Strong visual hierarchy with varied font sizes
- Cards, badges, feature grids, testimonial sections as appropriate
- Realistic marketing copy — no lorem ipsum
- NO Google Fonts CDN — use system fonts or embed font-face with base64 if needed
"""

DESIGN_SYSTEM = """
DESIGN TOKENS:
- Define all colors in :root as CSS variables
- Consistent spacing scale (0.25rem increments)
- Consistent border-radius (4px, 8px, 12px, 16px, 24px)
- Consistent shadows (sm, md, lg)
- Typography scale (xs through 5xl)

ADVANCED DESIGN:
- Premium SaaS aesthetic
- Large bold headline with gradient text
- Glassmorphism cards where appropriate
- Sticky navigation with smooth scroll
- Hover micro-interactions on all interactive elements
- Mobile-first responsive design
"""


# ─────────────────────────────────────────────────────────────────────────────
# DEFAULT — HTML + CSS + JS (iframe)
# ─────────────────────────────────────────────────────────────────────────────

def build_default_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete production-ready website.

USER REQUEST:
{user_prompt}

ROLE:
You are a world-class Senior UI/UX Designer, Frontend Architect, and Product Designer.
Your goal is to generate a website comparable to: Stripe, Linear, Vercel, Framer, Webflow.

{BASE_RULES}

FORMAT:
- Return a single complete <!DOCTYPE html> document.
- Write ALL styles as pure CSS inside a <style> tag. NO CDN. NO external links.
- Use system fonts only: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- All layout, spacing, colors, and components must be hand-written CSS.
- All JS in a <script> tag at the bottom of <body>.
- No external CSS or JS files of any kind.

MANDATORY SECTIONS (each with data-section-id):
1. Navigation Bar       (data-section-id="navbar")
2. Hero Section         (data-section-id="hero")
3. Features Section     (data-section-id="features")   — min 6 feature cards
4. Benefits Section     (data-section-id="benefits")   — min 4 benefit cards
5. Testimonials         (data-section-id="testimonials") — min 3
6. FAQ Section          (data-section-id="faq")         — min 5 items, accordion style
7. Contact Section      (data-section-id="contact")
8. Footer               (data-section-id="footer")

{QUALITY_BAR}

{DESIGN_SYSTEM}

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# THREE.JS (iframe) — use raw WebGL or Canvas 2D, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_threejs_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete interactive 3D scene using ONLY browser built-in APIs.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert WebGL and Canvas 2D developer.

{BASE_RULES}

FORMAT:
- Single complete <!DOCTYPE html> file.
- DO NOT load Three.js or any CDN. Use raw WebGL or Canvas 2D with 3D math instead.
- Use CSS 3D transforms, Canvas 2D with projection math, or raw WebGL.
- Canvas fills full viewport: width:100vw; height:100vh; margin:0; overflow:hidden.
- Include animation loop with requestAnimationFrame.
- Add mouse/touch interactivity.
- No external assets — all geometries generated in JS.

QUALITY BAR:
- Visually stunning 3D scene using only native browser APIs
- Smooth 60fps animation
- Mouse interactivity (rotate, zoom, etc.)

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# GSAP / ANIMATION (iframe) — use CSS @keyframes, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_gsap_prompt(user_prompt: str) -> str:
    return f"""
Generate a stunning animated web page using ONLY native CSS and JS animation APIs.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert in CSS animations and creative web experiences.

{BASE_RULES}

FORMAT:
- Single complete <!DOCTYPE html> file.
- DO NOT load GSAP or any CDN. Use native browser APIs instead:
  CSS @keyframes, CSS transitions, IntersectionObserver, Web Animations API, requestAnimationFrame.
- Write ALL styles as pure CSS inside a <style> tag.
- Use system fonts only. No Google Fonts CDN.
- Every section should have an entrance animation triggered by IntersectionObserver.
- Hero has dramatic CSS @keyframes entrance animation.

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# CHART / GRAPH (iframe) — use inline SVG or Canvas 2D, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_chart_prompt(user_prompt: str) -> str:
    return f"""
Generate a beautiful data dashboard using ONLY inline SVG and Canvas 2D.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert in data visualization and dashboard design.

{BASE_RULES}

FORMAT:
- Single complete <!DOCTYPE html> file.
- DO NOT load Chart.js or any CDN. Draw all charts with:
  - Inline SVG (<rect>, <polyline>, <path>, <circle stroke-dasharray>)
  - OR Canvas 2D API (ctx.fillRect, ctx.beginPath, etc.)
- Write ALL styles as pure CSS inside a <style> tag.
- Use system fonts only. No Google Fonts CDN.
- Use realistic mock data. Multiple chart types (bar, line, pie/doughnut).
- KPI cards with trend indicators.

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# BOOTSTRAP (iframe) — hand-written grid, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_bootstrap_prompt(user_prompt: str) -> str:
    return f"""
Generate a professional responsive HTML page with a hand-written CSS grid framework.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert CSS developer.

{BASE_RULES}

FORMAT:
- Single complete <!DOCTYPE html> file.
- DO NOT load Bootstrap or any CDN. Write your own grid and utility classes:
  .container, .row, .col, .col-4, .flex, .items-center, etc.
- All CSS inside a <style> tag. No external stylesheets.
- Use system fonts only. No Google Fonts CDN.

{QUALITY_BAR}

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# TAILWIND (explicit, iframe) — hand-written utilities, NO CDN
# ─────────────────────────────────────────────────────────────────────────────

def build_tailwind_prompt(user_prompt: str) -> str:
    return f"""
Generate a beautiful HTML page with premium custom CSS styling.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert frontend developer and UI designer.

{BASE_RULES}

FORMAT:
- Single complete <!DOCTYPE html> file.
- Write ALL styles as pure CSS inside a <style> tag. DO NOT use Tailwind CDN or any CDN.
- Use system fonts only. No Google Fonts CDN.
- All layout, spacing, grid, flexbox, and components must be hand-written CSS.
- All JS in a <script> tag at the bottom of <body>.
- No external CSS or JS files of any kind.

{QUALITY_BAR}
{DESIGN_SYSTEM}

Return only valid HTML.
"""


# ─────────────────────────────────────────────────────────────────────────────
# REACT (WebContainer)
# ─────────────────────────────────────────────────────────────────────────────

def build_react_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete React application component.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert React developer.

{BASE_RULES}

FORMAT:
- Output a single App.jsx file.
- Use React hooks (useState, useEffect, useCallback, useMemo).
- Inject CSS via: useEffect(() => {{ const s = document.createElement('style'); s.textContent = `/* your CSS */`; document.head.appendChild(s); }}, []);
- Export default: export default function App() {{ ... }}
- All child components defined in the same file.
- No external npm packages except React.

{QUALITY_BAR}

Return only valid JSX/React code.
"""


# ─────────────────────────────────────────────────────────────────────────────
# VUE (WebContainer)
# ─────────────────────────────────────────────────────────────────────────────

def build_vue_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete Vue 3 single-file component.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert Vue 3 developer.

{BASE_RULES}

FORMAT:
- Output a single App.vue file with <template>, <script setup>, and <style scoped>.
- Use Vue 3 Composition API (ref, computed, onMounted, watch).
- All child components defined inline in the same file.
- No external packages except Vue.

Return only valid Vue SFC code.
"""


# ─────────────────────────────────────────────────────────────────────────────
# SVELTE (WebContainer)
# ─────────────────────────────────────────────────────────────────────────────

def build_svelte_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete Svelte component.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert Svelte developer.

{BASE_RULES}

FORMAT:
- Output a single App.svelte file with <script>, markup, and <style>.
- Use Svelte reactivity ($:, stores, lifecycle hooks).
- Self-contained — all logic in one file.
- No external packages except Svelte.

Return only valid Svelte code.
"""


# ─────────────────────────────────────────────────────────────────────────────
# NEXT.JS (WebContainer)
# ─────────────────────────────────────────────────────────────────────────────

def build_next_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete Next.js page component.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert Next.js developer.

{BASE_RULES}

FORMAT:
- Output a single pages/index.jsx file.
- Use Next.js conventions (Image, Link, useRouter) where appropriate.
- Style with pure CSS-in-JS or a <style jsx> block (assume styled-jsx is available).
- No external CSS CDN of any kind.
- No external packages except Next.js.

{QUALITY_BAR}

Return only valid Next.js JSX code.
"""


# ─────────────────────────────────────────────────────────────────────────────
# NODE / EXPRESS (WebContainer)
# ─────────────────────────────────────────────────────────────────────────────

def build_node_prompt(user_prompt: str) -> str:
    return f"""
Generate a complete Node.js Express application.

USER REQUEST:
{user_prompt}

ROLE:
You are an expert Node.js and Express developer.

{BASE_RULES}

FORMAT:
- Output a single server.js file.
- Use express.json() and express.static().
- Serve a beautiful HTML frontend from GET / using res.send().
- The inline HTML must use pure CSS in a <style> tag — no CDN of any kind.
- Include realistic REST API endpoints with mock JSON data.
- Use ES modules (import/export) syntax.
- No external packages except express.

Return only valid Node.js code.
"""


# ─────────────────────────────────────────────────────────────────────────────
# SELECTOR — called from llm_service.py or routes/generate.py
# ─────────────────────────────────────────────────────────────────────────────

def build_website_prompt(user_prompt: str, framework: str = "") -> str:
    """
    Select the correct prompt builder based on the framework detected
    by the frontend classifier. Falls back to the default HTML prompt.
    """
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

    # Default: plain HTML + CSS + JS
    return build_default_prompt(user_prompt)