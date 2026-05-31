from fastapi import APIRouter
from app.services.project_service import (
    get_projects,
    delete_project
)

router = APIRouter()


@router.get("/projects")
async def projects():
    return get_projects()


@router.delete("/projects/{project_id}")
async def remove_project(project_id: int):

    return delete_project(project_id)