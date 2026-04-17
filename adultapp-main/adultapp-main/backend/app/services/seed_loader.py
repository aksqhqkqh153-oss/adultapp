import json
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "platform_seed.json"
PROJECT_STATUS_FILE = Path(__file__).resolve().parent.parent / "data" / "project_status.json"


def load_seed() -> dict[str, Any]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_project_status() -> dict[str, Any]:
    with open(PROJECT_STATUS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
