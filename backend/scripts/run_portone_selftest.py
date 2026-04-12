from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from app.routers.api import _run_internal_payment_selftests  # noqa: E402


if __name__ == '__main__':
    report = _run_internal_payment_selftests()
    print(json.dumps(report, ensure_ascii=False, indent=2))
