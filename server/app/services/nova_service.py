"""
nova_service.py

The entire LLM backend — Bedrock streaming, SSE formatting,
section-edit merging, HTML validation, and self-correction.

Only change from before: converse_stream() + asyncio.to_thread()
so the event loop never blocks, plus real SSE events the client expects.
"""

import os
import re
import json
import asyncio
import boto3
from dotenv import load_dotenv
from app.prompts.website_prompt import get_prompts
from app.prompts.website_prompt import get_prompts
load_dotenv()

# ─── Constants ────────────────────────────────────────────────────────────────
MAX_RETRIES           = 2
RETRY_DELAY_MS        = 0.8          # seconds
MAX_CORRECTION_LOOPS  = 2
REQUIRED_SECTIONS     = [
    "navbar", "hero", "features", "benefits",
    "testimonials", "faq", "contact", "footer"
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def sse(event: str, data: dict) -> str:
    """Format one SSE message exactly as the client expects."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def strip_code_fences(text: str) -> str:
    text = re.sub(r'^```html\s*', '', text, flags=re.I)
    text = re.sub(r'^```\s*',     '', text, flags=re.I)
    text = re.sub(r'```\s*$',     '', text, flags=re.I)
    return text.strip()


def strip_external_resources(html: str) -> str:
    """Remove CDN links, external images, fix CSS class selectors."""
    # Remove external <script src>, <link href>, @import url()
    html = re.sub(r'<script[^>]+src=["\']https?://[^"\']+["\'][^>]*>(</script>)?', '', html, flags=re.I)
    html = re.sub(r'<link[^>]+href=["\']https?://[^"\']+["\'][^>]*/?>', '', html, flags=re.I)
    html = re.sub(r'@import\s+url\([\'"]?https?://[^\)]+[\'"]?\)\s*;?', '', html, flags=re.I)
    html = re.sub(r'@import\s+[\'"]https?://[^\'"]+[\'"]\s*;?', '', html, flags=re.I)
    # Remove placeholder image URLs
    html = re.sub(
        r'src=["\']https?://(via\.placeholder|picsum\.photos|placehold)\.[a-z]+[^"\']*["\']',
        'src=""', html, flags=re.I
    )
    # Fix .section.class -> .section .class (one global pass, no loop)
    html = re.sub(
        r'\.(navbar|hero|features|benefits|testimonials|faq|contact|footer|item)\.([a-zA-Z0-9_-]+)',
        r'.\1 .\2', html, flags=re.I
    )
    return html


def validate_html(html: str) -> list[str]:
    """Returns a list of error strings. Empty list = valid."""
    errors = []

    # Unclosed <div> tags
    open_divs  = len(re.findall(r'<div[^>]*>', html, re.I))
    close_divs = len(re.findall(r'</div>', html, re.I))
    if open_divs != close_divs:
        errors.append(f"Unclosed <div> tags: opened {open_divs}, closed {close_divs}")

    # Placeholder text
    if re.search(r'lorem\s+ipsum|dolor\s+sit\s+amet|placeholder\s+image|via\.placeholder|picsum', html, re.I):
        errors.append("Contains placeholder text or images. Replace with realistic content.")

    # Missing mandatory sections
    missing = [s for s in REQUIRED_SECTIONS if f'data-section-id="{s}"' not in html]
    if missing:
        errors.append(f"Missing mandatory sections: {', '.join(missing)}")

    # Remaining CDN links
    if re.search(r'https?://(cdn|unpkg|jsdelivr|fonts\.google|use\.fontawesome|tailwindcss)', html, re.I):
        errors.append("External CDN links still present.")

    return errors


def extract_section(html: str, section_id: str) -> str:
    """Pull only the target section out of the full page — saves tokens."""
    pattern = re.compile(
        rf'<(section|nav|header|footer|div)([^>]*data-section-id=["\']{ re.escape(section_id) }["\'][^>]*)>',
        re.I
    )
    m = pattern.search(html)
    if not m:
        return html  # fallback: return full html
    tag = m.group(1).lower()
    start = m.start()
    idx = m.end()
    depth = 1
    open_re  = re.compile(rf'<{tag}[\s>]', re.I)
    close_re = re.compile(rf'</{tag}>', re.I)
    while depth > 0 and idx < len(html):
        next_open  = open_re.search(html, idx)
        next_close = close_re.search(html, idx)
        if not next_close:
            break
        if next_open and next_open.start() < next_close.start():
            depth += 1
            idx = next_open.start() + 1
        else:
            depth -= 1
            if depth == 0:
                end = next_close.end()
                return html[start:end]
            idx = next_close.start() + 1
    return html  # fallback


def merge_section(full_html: str, section_id: str, new_section: str) -> str:
    """Stitch the edited section back into the full page."""
    pattern = re.compile(
        rf'<(section|nav|header|footer|div)([^>]*data-section-id=["\']{ re.escape(section_id) }["\'][^>]*)>',
        re.I
    )
    m = pattern.search(full_html)
    if not m:
        return new_section  # fallback
    tag = m.group(1).lower()
    start = m.start()
    idx = m.end()
    depth = 1
    open_re  = re.compile(rf'<{tag}[\s>]', re.I)
    close_re = re.compile(rf'</{tag}>', re.I)
    while depth > 0 and idx < len(full_html):
        next_open  = open_re.search(full_html, idx)
        next_close = close_re.search(full_html, idx)
        if not next_close:
            break
        if next_open and next_open.start() < next_close.start():
            depth += 1
            idx = next_open.start() + 1
        else:
            depth -= 1
            if depth == 0:
                end = next_close.end()
                return full_html[:start] + new_section + full_html[end:]
            idx = next_close.start() + 1
    return new_section  # fallback


# ─── Core streaming call (runs boto3 in a thread — never blocks event loop) ──

async def _stream_from_bedrock(
    client,
    model_id: str,
    system_prompt: str,
    user_message: str,
    max_tokens: int,
    temperature: float,
) -> str:
    """
    Calls Bedrock converse_stream in a thread, accumulates and returns full HTML.
    This is an internal helper — the public method yields SSE events.
    """
    payload = dict(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": user_message}]}],
        system=[{"text": system_prompt}],
        inferenceConfig={"maxTokens": max_tokens, "temperature": temperature, "topP": 0.9},
    )

    # boto3 converse_stream is synchronous — offload to thread pool
    response = await asyncio.to_thread(client.converse_stream, **payload)

    accumulated   = ""
    fence_stripped = False
    fence_buffer   = ""

    for event in response.get("stream", []):
        delta = (event.get("contentBlockDelta") or {}).get("delta") or {}
        text  = delta.get("text", "")
        if not text:
            continue

        # Strip opening ```html fence on first chunk
        if not fence_stripped:
            fence_buffer += text
            if len(fence_buffer) >= 10 or "<" in fence_buffer:
                text = re.sub(r'^```html\s*', '', fence_buffer, flags=re.I)
                text = re.sub(r'^```\s*',     '', text,         flags=re.I)
                fence_stripped = True
                fence_buffer   = ""
            else:
                continue

        accumulated += text

    return strip_external_resources(strip_code_fences(accumulated))


# ─── NovaService — the class your routes import ───────────────────────────────

class NovaService:

    def __init__(self):
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=os.getenv("AWS_REGION", "ap-southeast-2"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        self.model_id = os.getenv("MODEL_ID", "amazon.nova-pro-v1:0")

    async def stream_website(
        self,
        user_prompt:  str,
        framework:    str = "",
        section_id:   str = "",
        current_html: str = "",
    ):
        """
        Async generator — yields SSE strings the client parses.

        Events emitted:
          event: chunk        { text: str }          — streaming token
          event: done         { html: str }           — final HTML
          event: correcting   { message: str }        — self-correction started
          event: error        { message: str }        — something went wrong
        """
        is_section_edit = bool(section_id and current_html)

        # ── Get prompts from your website_prompt.py ────────────────────────
        section_html = extract_section(current_html, section_id) if is_section_edit else ""
        system_prompt = ("You are an expert web developer.")
        prompts = get_prompts(user_prompt, framework, section_id, section_html)
        system_prompt = prompts["system_prompt"]
        user_message = prompts["user_message"]

        # ── Dynamic limits — section edits are small ───────────────────────
        max_tokens  = 2048 if is_section_edit else 8192
        temperature = 0.5  if is_section_edit else 0.7

        # ── Stream from Bedrock with retry ─────────────────────────────────
        last_error = None
        result_html = ""

        for attempt in range(MAX_RETRIES + 1):
            if attempt > 0:
                await asyncio.sleep(RETRY_DELAY_MS * attempt)

            try:
                # We need to stream chunks to the client AND accumulate.
                # Run boto3 in thread, but yield chunks as they arrive.
                payload = dict(
                    modelId=self.model_id,
                    messages=[{"role": "user", "content": [{"text": user_message}]}],
                    system=[{"text": system_prompt}],
                    inferenceConfig={"maxTokens": max_tokens, "temperature": temperature, "topP": 0.9},
                )

                response = await asyncio.to_thread(self.client.converse_stream, **payload)

                accumulated    = ""
                fence_stripped = False
                fence_buffer   = ""

                for event in response.get("stream", []):
                    delta = (event.get("contentBlockDelta") or {}).get("delta") or {}
                    text  = delta.get("text", "")
                    if not text:
                        continue

                    # Strip ```html fence on first chunk
                    if not fence_stripped:
                        fence_buffer += text
                        if len(fence_buffer) >= 10 or "<" in fence_buffer:
                            text = re.sub(r'^```html\s*', '', fence_buffer, flags=re.I)
                            text = re.sub(r'^```\s*',     '', text,         flags=re.I)
                            fence_stripped = True
                            fence_buffer   = ""
                        else:
                            continue

                    accumulated += text
                    # CODE OPT: yield raw chunk, strip once at end
                    if text.strip():
                        yield sse("chunk", {"text": text})

                result_html = strip_external_resources(strip_code_fences(accumulated))
                last_error  = None
                break  # success — exit retry loop

            except Exception as e:
                last_error = e
                msg = str(e)
                is_transient = any(k in msg for k in [
                    "ThrottlingException", "ServiceUnavailableException",
                    "InternalServerException", "timeout", "ECONNRESET"
                ])
                if not is_transient or attempt == MAX_RETRIES:
                    yield sse("error", {"message": f"Bedrock error: {msg}"})
                    return

        if last_error:
            yield sse("error", {"message": str(last_error)})
            return

        # ── Merge section back into full page ──────────────────────────────
        if is_section_edit and current_html and section_id:
            result_html = merge_section(current_html, section_id, result_html)

        current_html_state = result_html

        # ── Self-correction loop (full page only) ──────────────────────────
        if not is_section_edit:
            for _ in range(MAX_CORRECTION_LOOPS):
                errors = validate_html(current_html_state)
                if not errors:
                    break

                yield sse("correcting", {"message": "Fixing validation errors..."})

                correction_prompt = (
                    "Fix these errors in the HTML:\n"
                    + "\n".join(f"{i+1}. {e}" for i, e in enumerate(errors))
                    + "\n\nOutput ONLY corrected HTML. First char <. No explanations.\n\n"
                    + current_html_state
                )

                try:
                    corrected = await _stream_from_bedrock(
                        self.client, self.model_id,
                        system_prompt, correction_prompt,
                        max_tokens, temperature
                    )
                    current_html_state = corrected
                except Exception as e:
                    yield sse("error", {"message": f"Correction failed: {e}"})
                    return

        # ── Done ───────────────────────────────────────────────────────────
        yield sse("done", {"html": current_html_state})


# Singleton used by routes
nova_service = NovaService()