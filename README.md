# adultapp starter v4

성인용품 거래소 플랫폼의 웹 우선 MVP + 앱 래퍼 준비용 프로젝트입니다.

## 이번 보완 범위
- 실 PG 연동 준비용 merchant/api/webhook secret 바인딩 구조 추가
- 실 PASS/NICE 성인인증 준비용 provider / callback / status API 보강
- 세무증빙 자동화 준비용 tax dashboard / 발급사 env / 월마감 구조 보강
- JWT 로그인 / RBAC / 관리자 TOTP 2FA API 및 프론트 테스트 화면 추가
- 이중승인 queue / 보안 제어 / 앱 심사용 안전모드 UI 정리
- 앱/웹 공용 일반 커머스형 프론트 UI에 실연동 버튼/레이아웃 추가

## 샘플 로그인
- 관리자: `admin@example.com / admin1234`
- 사업자: `seller@example.com / seller1234`
- 고객: `customer@example.com / customer1234`

## 빠른 실행
### backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### frontend
```bash
cd frontend
npm install
npm run dev
```

## 실키 바인딩 위치
- `backend/app/config.py` : JWT / PG / PASS/NICE / 세무 / 2FA env 키
- `backend/app/routers/api.py` : 로그인 / RBAC / 2FA / integration overview API
- `frontend/src/App.tsx` : 관리자 로그인, OTP 검증, 바인딩 상태, 승인 큐 UI
- `infra/*.env.example` : Railway / Cloudflare / PG / 성인인증 / 보안 변수 예시

## 바로 이어서 해야 할 일
1. 실제 PG 공급사 SDK/서명 검증 모듈 분리
2. PASS/NICE 실 callback 결과를 계정활성화 플로우와 연결
3. 현금영수증/세금계산서 실제 발급사 연동 및 재시도 큐 구현
4. 관리자 2FA 백업코드, 분실복구, 감사로그 해시체인 저장 추가


## 테스트 계정

- 관리자: `admin@example.com` / `admin1234`
- 사업자: `seller@example.com` / `seller1234`
- 소비자: `customer@example.com` / `customer1234`
- 일반회원: `general@example.com` / `general1234`

## Cloudflare Pages 수동 배포
```bash
cd frontend
npm install
npx wrangler login
npx wrangler whoami
```

```bash
cd frontend
VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api npm run cf:build
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

Windows PowerShell helper:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows\cloudflare_pages_manual_deploy.ps1 -BackendApiBaseUrl "https://your-railway-domain.up.railway.app/api" -PagesProjectName "adultapp"
```


## Windows PowerShell 5.1 ZIP 반영
```powershell
$repo = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_randomchat_postgres_update_20260410.zip"

Set-Location $repo
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd
Expand-Archive -LiteralPath $zip -DestinationPath $repo -Force
git status --short
```

## Windows PowerShell 5.1 Cloudflare Pages 수동 업로드
```powershell
$repo = "C:\Users\icj24\Downloads\adultapp"
Set-Location "$repo\frontend"
$env:VITE_API_BASE_URL = "https://your-railway-domain.up.railway.app/api"
$env:VITE_APP_REVIEW_MODE = "true"
$env:VITE_MOBILE_WEB_FALLBACK_URL = "https://adultapp.pages.dev"
npm install
npm run build
Test-Path .\dist\index.html
npx wrangler whoami
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## 프론트 무한 로딩 점검
- API 확인: 브라우저에서 `https://your-railway-domain.up.railway.app/api/health` 가 `{"status":"ok"}` 를 반환하는지 확인
- 배포 환경변수 확인: `VITE_API_BASE_URL` 이 실제 Railway `/api` 주소를 가리키는지 확인
- 빌드 산출물 확인: `frontend\dist\index.html` 존재 여부 확인
- 캐시 확인: 브라우저 강력 새로고침(Ctrl + F5) 또는 시크릿 모드에서 재확인
- Cloudflare 재배포: `npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true`


## npm install 실패 시 대체 실행
```powershell
$repo = "C:\Users\icj24\Downloads\adultapp"
Set-Location "$repo\frontend"
$env:VITE_API_BASE_URL = "https://your-railway-domain.up.railway.app/api"
$env:VITE_APP_REVIEW_MODE = "true"
$env:VITE_MOBILE_WEB_FALLBACK_URL = "https://adultapp.pages.dev"
if (-not (Test-Path ".\node_modules")) { throw "node_modules 없음 - npm install 먼저 필요" }
npm run build
Test-Path .\dist\index.html
npx wrangler whoami
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## 자주 발생하는 오류 빠른 대응
- PowerShell Expand-Archive 오류: ZIP 파일이나 대상 폴더 파일이 열려 있으면 실패할 수 있음
- npm 모듈 누락 오류: `node_modules` 삭제 후 `npm install` 재실행
- wrangler 인증 오류: `npx wrangler login` 후 `npx wrangler whoami` 재확인
- 프론트 무한 로딩: `/api/health`, `dist/index.html`, `VITE_API_BASE_URL`, 브라우저 캐시, Cloudflare 재배포 순으로 점검


## Random chat policy baseline (2026-04-10)
- 신고 누적 자동정지 기준은 건수가 아니라 점수 기준입니다.
- 기본 가중치: 욕설 1점, 스팸 1점, 개인정보요구 2점, 음란물전송 3점, 불법권유 3점, 기타 1점
- 기본 제재: 5점=3일, 10점=7일, 20점=30일, 21점 이상=관리자 검토
- 지역 표기는 시 단위 축약 표준(서울특별시→서울, 인천광역시→인천)입니다.
- SQLite는 로컬 개발 전용이며 staging/production에서는 PostgreSQL만 허용합니다.
- WebSocket은 Railway 단독으로 운영하고, 단일 인스턴스 한계 또는 다중 인스턴스 확장이 필요할 때 Redis Pub/Sub 구조로 전환합니다.
