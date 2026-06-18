"""
stream.py

POST /generate  — the single endpoint the client calls.

Verifies Supabase JWT, validates the request body,
then streams SSE events from nova_service.stream_website().
"""

import os
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from supabase import create_client
from app.services.nova_service import nova_service
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase client for JWT verification
_supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_ANON_KEY", ""),
)


# ─── Request body ─────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt:      str
    projectId:   str
    framework:   str = ""
    sectionId:   str = ""
    currentHtml: str = ""

    @field_validator("prompt")
    @classmethod
    def prompt_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("prompt must not be empty")
        if len(v) > 2000:
            raise ValueError("prompt must be 2000 characters or fewer")
        return v

    @field_validator("projectId")
    @classmethod
    def project_id_required(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("projectId is required")
        return v.strip()


# ─── Auth helper ──────────────────────────────────────────────────────────────

def verify_token(request: Request) -> str:
    """Extract and verify Supabase JWT. Returns user_id on success."""
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")
    token = auth[7:].strip()
    try:
        user = _supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ─── Route ────────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate(body: GenerateRequest, request: Request):
    """
    POST /generate

    Body: { prompt, projectId, framework?, sectionId?, currentHtml? }

    SSE events streamed back:
      event: chunk      { text: str }        — token fragment
      event: done       { html: str }        — full final HTML
      event: correcting { message: str }     — self-correction running
      event: error      { message: str }     — fatal error
    """
    # Verify JWT
    verify_token(request)

    # Validate: sectionId requires currentHtml
    if body.sectionId and not body.currentHtml:
        raise HTTPException(
            status_code=400,
            detail="currentHtml is required when sectionId is provided"
        )

    return StreamingResponse(
        nova_service.stream_website(
            user_prompt=body.prompt,
            framework=body.framework,
            section_id=body.sectionId,
            current_html=body.currentHtml,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "Connection":       "keep-alive",
            "X-Accel-Buffering": "no",   # disable Nginx buffering
        },
    )