from fastapi import APIRouter
from app.validators.generate_request import GenerateRequest
from app.services.llm_service import generate_website
from app.services.project_service import save_project

router = APIRouter()

@router.post("/generate")
async def generate(request: GenerateRequest):

    html = await generate_website(
    request.prompt
)
    save_project(
    request.prompt,
    html
)
    
    return {
        "success": True,
        "html": html
    }