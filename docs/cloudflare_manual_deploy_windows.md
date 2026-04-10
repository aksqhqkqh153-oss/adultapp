# Cloudflare Pages 수동 배포 (Windows PowerShell 5.1)

## 프로젝트 기준
- Frontend root: `frontend`
- Build output: `dist`
- Pages project: `adultapp`
- API base: `https://<railway-domain>/api`

## 1) ZIP 직접 반영 + Git 확인
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

## 2) 일반 빌드 + 수동 업로드
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

## 3) node_modules가 이미 있을 때 설치 생략 대체 명령어
```powershell
$repo = "C:\Users\icj24\Downloads\adultapp"
Set-Location "$repo\frontend"
$env:VITE_API_BASE_URL = "https://your-railway-domain.up.railway.app/api"
$env:VITE_APP_REVIEW_MODE = "true"
$env:VITE_MOBILE_WEB_FALLBACK_URL = "https://adultapp.pages.dev"
if (-not (Test-Path .\node_modules)) { throw "node_modules 없음 - npm install 먼저 실행 필요" }
npm run build
Test-Path .\dist\index.html
npx wrangler whoami
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## 4) 프론트 무한 로딩 점검
```powershell
# API 헬스체크
Invoke-WebRequest "https://your-railway-domain.up.railway.app/api/health" | Select-Object -ExpandProperty Content

# 빌드 결과 확인
Test-Path "C:\Users\icj24\Downloads\adultapp\frontend\dist\index.html"

# 캐시 회피용 재배포
Set-Location "C:\Users\icj24\Downloads\adultapp\frontend"
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

## 자주 나는 오류와 대체 명령어

### Expand-Archive : 파일이 사용 중이거나 경로 충돌
- 원인: ZIP 또는 대상 파일이 열려 있음
- 대체: PowerShell 종료 후 다시 실행, 탐색기 미리보기 닫기

### npm install 실패 / rollup 모듈 누락
- 원인: 손상된 node_modules 또는 package-lock 불일치
```powershell
Set-Location "C:\Users\icj24\Downloads\adultapp\frontend"
if (Test-Path .\node_modules) { Remove-Item .\node_modules -Recurse -Force }
if (Test-Path .\package-lock.json) { npm install } else { npm install }
```

### npx wrangler whoami 실패
- 원인: 로그인 만료 또는 wrangler 미설치
```powershell
Set-Location "C:\Users\icj24\Downloads\adultapp\frontend"
npx wrangler login
npx wrangler whoami
```

### dist가 없어서 배포 실패
- 원인: build 실패 또는 환경변수 누락
```powershell
Set-Location "C:\Users\icj24\Downloads\adultapp\frontend"
$env:VITE_API_BASE_URL = "https://your-railway-domain.up.railway.app/api"
npm run build
Get-ChildItem .\dist
```
