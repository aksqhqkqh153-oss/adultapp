Railway backend deployment

Recommended settings
- Root Directory: backend
- Start Command: ./start.sh

If Start Command is empty, Procfile can also be used.


Required runtime
- Root Directory: backend
- Start Command: ./start.sh
- DATABASE_URL: Railway PostgreSQL connection string
- For production, use PostgreSQL as the primary database. SQLite is for local fallback/runtime repair only.
