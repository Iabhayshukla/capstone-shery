import json
from pathlib import Path
from datetime import datetime

PROJECT_FILE = Path("data/projects.json")


def save_project(prompt: str, html: str):

    with open(PROJECT_FILE, "r", encoding="utf-8") as f:
        projects = json.load(f)

    project = {
        "id": len(projects) + 1,
        "prompt": prompt,
        "html": html,
        "created_at": datetime.now().isoformat()
    }

    projects.append(project)

    with open(PROJECT_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)

    return project


def get_projects():

    with open(PROJECT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def delete_project(project_id: int):

    with open(PROJECT_FILE, "r", encoding="utf-8") as f:
        projects = json.load(f)

    projects = [
        p for p in projects
        if p["id"] != project_id
    ]

    with open(PROJECT_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)

    return {
        "success": True
    }