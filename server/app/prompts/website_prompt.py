"""
website_prompt.py — Optimized prompt builders for AWS Bedrock Nova Pro.

Token optimization strategy:
- SYSTEM prompt = lean role + hard rules (sent every request)
- USER message  = framework-specific detail + chain-of-thought (varies per request)
- Section edits = ultra-lean (~85 tokens system, ~100 tokens user)
- Full page     = rich detail only in user message, not repeated in system
"""

# ─── SHARED CONSTANTS ─────────────────────────────────────────────────────────
# Kept as short as possible — every char here costs tokens on EVERY request.

_OUTPUT_RULES = "Output ONLY raw code. First char < (HTML) or i (JSX). No markdown, no fences, no explanations."

_NO_CDN = "NO CDN/external URLs. No <script src=http>, no <link href=http>, no @import url(http). System fonts only. Inline SVG for icons."

_NO_TAILWIND = "NO Tailwind classes. Write your own CSS class names."

_QUALITY = (
    "Premium dark SaaS aesthetic (Stripe/Linear style). "
    "Gradient text, glassmorphism cards, smooth hover transitions, "
    "IntersectionObserver fade-up animations. "
    "Realistic copy — no lorem ipsum, no placeholder images."
)

_DESIGN_TOKENS = """\
:root {
  --primary:#6366f1; --primary-dark:#4f46e5; --accent:#f59e0b;
  --bg:#0f0f0f; --surface:#1a1a1a; --surface-2:#242424;
  --border:rgba(255,255,255,0.08); --text:#f1f5f9; --text-muted:#94a3b8;
  --radius:12px; --shadow:0 4px 24px rgba(0,0,0,.4);
  --font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}"""

_SECTIONS = """\
8 MANDATORY SECTIONS in order (each needs data-section-id):
navbar  → sticky, logo, 4-5 links, CTA button
hero    → h1 with gradient span, subtitle, 2 buttons, animated gradient bg
features→ 6 glassmorphism cards in 3×2 grid
benefits→ 4 benefit rows, emoji/SVG icons
testimonials→ 3 cards (SVG circle avatar, quote, name, title)
faq     → 5 items via <details><summary> (no JS)
contact → form (name,email,message) + submit → alert("Message sent!")
footer  → 3-4 columns, links, copyright, SVG social icons"""

_CHAIN_OF_THOUGHT = """\
Plan before coding:
1. What site type? (SaaS/portfolio/e-commerce/blog)
2. Color scheme & layout direction
3. HTML structure → CSS with design tokens → minimal JS
4. Every section: data-section-id + real compelling copy"""

_FEW_SHOT = """\
HERO EXAMPLE (copy this pattern):
<section data-section-id="hero" class="hero">
  <h1>Build AI Websites <span class="grad">in Minutes</span></h1>
  <p>Production-ready code from a single prompt.</p>
  <div class="btns">
    <button class="btn-primary">Get Started →</button>
    <button class="btn-ghost">Watch Demo</button>
  </div>
</section>"""

_EXTRA_HTML = """\
Also required:
• Navbar: transparent → solid on scroll (IntersectionObserver on hero)
• Hero: gradient bg animation + fade-up entrance
• Feature cards: backdrop-filter:blur(12px); background:rgba(255,255,255,.05)
• FAQ details[open]: smooth reveal animation
• Form: e.preventDefault() + alert("Message sent!")
• CTA button: @keyframes pulse"""

# ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────
# These go into Bedrock's "system" field.
# Keep LEAN — sent on every single request.

SYSTEM_PROMPT_FULL = f"You are an expert frontend developer. {_OUTPUT_RULES}\n{_NO_CDN}\n{_NO_TAILWIND}"

SYSTEM_PROMPT_SECTION = f"You are an expert frontend developer editing ONE section. {_OUTPUT_RULES}\nKeep data-section-id unchanged. Keep existing CSS class names."

# ─── FRAMEWORK ADDENDUMS ──────────────────────────────────────────────────────
# Appended to user message only — NOT in system prompt.
# One line each — enough for the model to understand the constraint.

_FRAMEWORK = {
    "three":     "Use raw WebGL/Canvas2D with 3D math. No Three.js CDN. Mouse interactivity. requestAnimationFrame loop. Full viewport canvas.",
    "gsap":      "Use CSS @keyframes + Web Animations API. No GSAP CDN. Dramatic hero entrance, every section fades up on scroll.",
    "chart":     "All charts via inline SVG (<rect>,<polyline>,<circle>) or Canvas2D. Bar + line + pie charts. KPI cards with SVG trend arrows. Realistic mock data.",
    "bootstrap": "Hand-write .container .row .col .flex utility classes. No Bootstrap CDN.",
    "tailwind":  "Hand-write utility CSS (.flex .grid .p-4 etc). No Tailwind CDN.",
    "react":     "Single App.jsx. export default function App(). useState/useEffect. Inject CSS via useEffect style tag. All components in same file. No packages except React.",
    "vue":       "Single App.vue: <template><script setup><style scoped>. Composition API. No packages except Vue.",
    "svelte":    "Single App.svelte: <script> markup <style>. Svelte reactivity. No packages except Svelte.",
    "next":      "Single pages/index.jsx. Next.js Link/useRouter. <style jsx>. No packages except Next.js.",
    "node":      "Single server.js ES modules. GET / serves full HTML inline. 2-3 mock REST endpoints. No packages except express.",
}

def _get_addendum(framework: str) -> str:
    f = (framework or "").lower()
    for key, val in _FRAMEWORK.items():
        if key in f:
            return f"\nFRAMEWORK: {val}"
    return ""

# ─── USER MESSAGE BUILDERS ────────────────────────────────────────────────────

def _build_html_message(user_prompt: str, framework: str = "") -> str:
    """Full-page generation — rich detail in user message."""
    addendum = _get_addendum(framework)
    # Only include chain-of-thought + few-shot for default HTML (not framework variants)
    # Framework prompts already have enough constraints — CoT adds tokens without benefit
    cot_and_shot = f"\n{_CHAIN_OF_THOUGHT}\n\n{_FEW_SHOT}\n" if not framework else ""
    return f"""\
Generate a complete self-contained HTML page.

REQUEST: {user_prompt.strip()[:2000]}{addendum}

{_OUTPUT_RULES}
{_NO_CDN}
{_NO_TAILWIND}
{cot_and_shot}
{_SECTIONS}

{_QUALITY}

{_DESIGN_TOKENS}

{_EXTRA_HTML}

REMEMBER: First char <. No CDN. No Tailwind. No placeholders."""

def _build_section_message(section_html: str, section_id: str, user_prompt: str) -> str:
    """Section edit — ultra-lean, sends only the section."""
    return (
        f'Edit this section (data-section-id="{section_id}"):\n\n'
        f'{section_html}\n\n'
        f'Edit request: "{user_prompt.strip()[:500]}"\n\n'
        f'Output ONLY the updated section HTML. Keep data-section-id="{section_id}". First char <.'
    )

# ─── PUBLIC API — called by nova_service.py ───────────────────────────────────

def get_prompts(
    user_prompt: str,
    framework:   str = "",
    section_id:  str = "",
    section_html: str = ""
) -> dict:
    """
    Returns:
      system_prompt  → Bedrock 'system' field
      user_message   → Bedrock messages[0].content[0].text
      is_section_edit → bool
    """
    is_section_edit = bool(section_id and section_html)

    if is_section_edit:
        return {
            "system_prompt":  SYSTEM_PROMPT_SECTION,
            "user_message":   _build_section_message(section_html, section_id, user_prompt),
            "is_section_edit": True,
        }

    return {
        "system_prompt":  SYSTEM_PROMPT_FULL,
        "user_message":   _build_html_message(user_prompt, framework),
        "is_section_edit": False,
    }


# ─── CLI entry-point (called by prompt_bridge / tests) ───────────────────────

if __name__ == "__main__":
    import argparse, json, sys

    p = argparse.ArgumentParser()
    p.add_argument("--prompt",       required=True)
    p.add_argument("--framework",    default="")
    p.add_argument("--section-id",   default="")
    p.add_argument("--section-html", default="")
    args = p.parse_args()

    result = get_prompts(
        user_prompt=args.prompt,
        framework=args.framework,
        section_id=args.section_id,
        section_html=args.section_html,
    )
    print(json.dumps(result))