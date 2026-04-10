Railway backend deployment

Recommended settings
- Root Directory: backend
- Start Command: ./start.sh
- DATABASE_URL: Railway PostgreSQL connection string
- Production DB policy: PostgreSQL only
- SQLite policy: local fallback/debug only, not production

Suggested Railway variables
- DATABASE_URL=postgresql://postgres:password@host:5432/adultapp
- CORS_ORIGINS=https://adultapp.pages.dev,https://www.your-domain.com
- CORS_ORIGIN_REGEX=https://.*\.adultapp\.pages\.dev
- MEDIA_BASE_URL=https://your-railway-domain.up.railway.app/media

Operational notes
- Apply Alembic migration before first production launch.
- Random chat, moderation, and audit data should stay on PostgreSQL as the source of truth.
- Keep Railway service and Cloudflare Pages API base URL aligned on the same environment.
