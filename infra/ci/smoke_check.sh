#!/usr/bin/env bash
set -e
cd backend
python -m py_compile app/*.py app/routers/*.py
cd ../frontend
npm run build
