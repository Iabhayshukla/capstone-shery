# server/app/services/validator.py

import re
from typing import List, Tuple, Dict, Any
from app.services.llm_service import generate_website  # assuming you have this

class HTMLValidator:
    """Check generated HTML for common issues and optionally auto-correct."""

    REQUIRED_SECTIONS = ['navbar', 'hero', 'features', 'benefits', 'testimonials', 'faq', 'contact', 'footer']

    @staticmethod
    def validate(html: str) -> Tuple[bool, List[str]]:
        """
        Returns (is_valid, list_of_error_messages).
        """
        errors = []

        # 1. Unclosed div tags
        open_divs = len(re.findall(r'<div[^>]*>', html, re.IGNORECASE))
        close_divs = len(re.findall(r'</div>', html, re.IGNORECASE))
        if open_divs != close_divs:
            errors.append(f"Unclosed <div> tags: opened {open_divs}, closed {close_divs}")

        # 2. Placeholder text (lorem ipsum, placeholder image, etc.)
        placeholder_pattern = re.compile(
            r'lorem\s+ipsum|dolor\s+sit\s+amet|placeholder\s+image|via\.placeholder|picsum',
            re.IGNORECASE
        )
        if placeholder_pattern.search(html):
            errors.append("Contains placeholder text or images (lorem ipsum, placeholder, etc.). Use realistic copy.")

        # 3. Missing mandatory sections (by data-section-id)
        for section in HTMLValidator.REQUIRED_SECTIONS:
            if f'data-section-id="{section}"' not in html:
                errors.append(f"Missing mandatory section: {section}")

        # 4. External CDN links
        cdn_pattern = re.compile(
            r'https?://(cdn|unpkg|jsdelivr|fonts\.google|use\.fontawesome|tailwindcss)',
            re.IGNORECASE
        )
        if cdn_pattern.search(html):
            errors.append("External CDN links found. All resources must be inline (no external scripts/styles).")

        # 5. Tailwind CSS classes
        tailwind_pattern = re.compile(
            r'class="[^"]*(?:bg-|text-|mt-|mb-|ml-|mr-|pt-|pb-|pl-|pr-|flex|grid|rounded-|shadow-|border-|hover:)[^"]*"',
            re.IGNORECASE
        )
        if tailwind_pattern.search(html):
            errors.append("Tailwind CSS classes detected. Use custom class names and write your own CSS.")

        return (len(errors) == 0, errors)

    @staticmethod
    async def correct_with_llm(
        invalid_html: str,
        errors: List[str],
        original_prompt: str,
        framework: str = ""
    ) -> str:
        """
        Ask the LLM to fix the HTML based on validation errors.
        Returns the corrected HTML.
        """
        correction_prompt = f"""The previous generated HTML has the following validation errors:
{chr(10).join(f'- {e}' for e in errors)}

Original request: "{original_prompt}"

Here is the invalid HTML:
```html
{invalid_html}