# Cloudflare Pages 수동 배포 (Windows)

## 프로젝트 준비
- Frontend root: `frontend`
- Build output: `dist`
- SPA fallback: `frontend/public/_redirects`
- 권장 API base: `https://<railway-domain>/api`

## 1회 로그인
```powershell
cd frontend
npm install
npx wrangler login
npx wrangler whoami
```

## 수동 배포
```powershell
cd frontend
$env:VITE_API_BASE_URL="https://your-railway-domain.up.railway.app/api"
$env:VITE_APP_REVIEW_MODE="true"
$env:VITE_MOBILE_WEB_FALLBACK_URL="https://m.example.com/safe"
npm run cf:build
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## 원클릭 스크립트
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cloudflare_manual_deploy.ps1 -BackendApiBaseUrl "https://your-railway-domain.up.railway.app/api" -PagesProjectName "adultapp"
```
