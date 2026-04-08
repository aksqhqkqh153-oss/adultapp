# 배포 가이드

## Frontend
- Cloudflare Pages
- Root directory: frontend
- Build command: npm run build
- Output directory: dist

## Backend
- Railway
- Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

## 필수 환경변수
- DATABASE_URL
- CORS_ORIGINS
- APP_REVIEW_MODE
