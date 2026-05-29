from fastapi import APIRouter
from app.validators.generate_request import GenerateRequest
from app.services.llm_service import generate_website
from app.prompts.website_prompt import build_website_prompt

router = APIRouter()

@router.post("/generate")
async def generate(request: GenerateRequest):

    full_prompt = build_website_prompt(
    request.prompt
)

    html = await generate_website(
        full_prompt
    )

    return {
        "success": True,
        "html": html
    }