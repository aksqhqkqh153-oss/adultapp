# START HERE

## 1. unzip
압축을 프로젝트 루트에 바로 풉니다.

## 2. backend
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

## 3. frontend
cd ../frontend
npm install
npm run dev

## 4. production adaptation
- DB를 Railway PostgreSQL로 교체
- frontend를 Cloudflare Pages에 연결
- app review mode CMS와 auth, PG, 세무 모듈 추가 구현

## 5. Cloudflare 수동 배포
cd frontend
npm install
npx wrangler login
$env:VITE_API_BASE_URL="https://your-railway-domain.up.railway.app/api"
npm run cf:build
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
