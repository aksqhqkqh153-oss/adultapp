# 배포 가이드

## Frontend
- Cloudflare Pages
- Root directory: frontend
- Build command: npm run build
- Output directory: dist
- SPA fallback: frontend/public/_redirects

## Frontend 수동 배포(CLI 권장)
```bash
cd frontend
npm install
npx wrangler login
npx wrangler whoami
VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api npm run cf:build
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## Windows PowerShell 수동 배포
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cloudflare_manual_deploy.ps1 -BackendApiBaseUrl "https://your-railway-domain.up.railway.app/api" -PagesProjectName "adultapp"
```

## Backend
- Railway
- Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

## 필수 환경변수
- DATABASE_URL
- CORS_ORIGINS
- APP_REVIEW_MODE
- VITE_API_BASE_URL
