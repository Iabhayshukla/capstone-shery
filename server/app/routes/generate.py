from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.nova_service import nova_service

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str
    projectId: str = ""
    framework: str = ""
    sectionId: str = ""
    currentHtml: str = ""

@router.post("/generate")
async def generate(body: GenerateRequest, request: Request):
    if not body.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")
    
    return StreamingResponse(
        nova_service.stream_website(
            user_prompt=body.prompt,
            framework=body.framework,
            section_id=body.sectionId,
            current_html=body.currentHtml,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )