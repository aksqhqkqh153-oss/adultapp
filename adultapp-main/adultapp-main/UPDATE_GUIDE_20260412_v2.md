# adultapp backend deploy fix v2

## Applied fixes
- normalized PostgreSQL URLs so `postgres://` and `postgresql+psycopg2://` resolve safely
- added PostgreSQL connection timeout and sslmode defaults for Railway runtime
- disabled heavy startup DB init/seed by default to avoid Railway healthcheck timeout
- added manual DB init script: `backend/scripts/init_runtime_db.py`
- kept `psycopg2-binary==2.9.10` as the single PostgreSQL driver entry

## Why the server was failing
1. earlier deployment crashed with `ModuleNotFoundError: No module named 'psycopg2'`
2. later deployment installed `psycopg2-binary` successfully, but startup remained blocked during application startup, so Railway healthcheck on `/api/health` kept failing
3. the fix is to make server startup lightweight and run DB init/seed manually after deployment

## Post-deploy steps
1. deploy backend
2. verify `/api/health`
3. turn on DB init and run `python scripts/init_runtime_db.py` once if needed
4. redeploy or restart service
