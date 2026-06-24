import json
import threading
from pathlib import Path
from datetime import datetime

PROJECT_FILE = Path("data/projects.json")

_file_lock = threading.Lock()


def save_project(prompt: str, html: str):

    with _file_lock:
        if PROJECT_FILE.exists():
            with open(PROJECT_FILE, "r", encoding="utf-8") as f:
                projects = json.load(f)
        else:
            PROJECT_FILE.parent.mkdir(parents=True, exist_ok=True)
            projects = []

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

    with _file_lock:
        if not PROJECT_FILE.exists():
            return []
        with open(PROJECT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)