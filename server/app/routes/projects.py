from fastapi import APIRouter, Request
from app.services.project_service import get_projects
from app.routes.stream import verify_token

router = APIRouter()


@router.get("/projects")
async def projects(request: Request):
    verify_token(request)
    return get_projects()