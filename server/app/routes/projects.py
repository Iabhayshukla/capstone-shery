from fastapi import APIRouter
from app.services.project_service import get_projects

router = APIRouter()


@router.get("/projects")
async def projects():
    return get_projects()