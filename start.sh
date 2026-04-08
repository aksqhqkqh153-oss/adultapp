#!/usr/bin/env bash
set -euo pipefail
cd backend
PORT_VALUE="${PORT:-8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE"
