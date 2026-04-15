# Railway Root Deploy Guide

This repository is configured to deploy from repository root.

Recommended Railway settings:
- Root Directory: /
- Custom Start Command: leave blank
- Builder: Railpack

If you need to set a start command manually, use:
- bash ./start.sh

Minimum environment variables:
- APP_ENV=production
- CORS_ORIGINS=https://adultapp.pages.dev
- JWT_SECRET_KEY=replace-with-random-secret
- JWT_ALGORITHM=HS256

Optional but recommended:
- DATABASE_URL=postgresql+psycopg://...

Healthcheck path:
- /healthz
