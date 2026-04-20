$ErrorActionPreference = "Stop"

# =========================
# fixed values
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260420_home_feed_infinite_scroll_pack.zip"
$branch = "main"
$pagesProject = "adultapp"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$dist = Join-Path $frontend "dist"
$static = Join-Path $backend "static"
$commitMsg = "update: add home feed infinite scroll demo posts"
$stashName = "zip-overlay-sync-$(Get-Date -Format yyyyMMddHHmmss)"

function Stop-RunningProcesses {
    Write-Host "1) 실행 중 프로세스 종료"
    Get-Process python,node,npm,uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    taskkill /F /IM python.exe /T *> $null
    taskkill /F /IM node.exe /T *> $null
    taskkill /F /IM npm.cmd /T *> $null
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path (Join-Path $project ".git"))) { throw ".git 폴더가 없습니다. 먼저 git clone 으로 프로젝트를 받아주세요: $project" }

Stop-RunningProcesses

Write-Host "2) ZIP 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "3) Git 최신 동기화 + ZIP 변경 재적용"
Set-Location $project

git rev-parse --is-inside-work-tree | Out-Null
git remote -v | Out-Null
git fetch origin

git checkout $branch

git stash push -u -m $stashName | Out-Null
git pull --rebase origin $branch

$stashEntry = git stash list | Select-String -Pattern ([regex]::Escape($stashName)) | Select-Object -First 1
if ($stashEntry) {
    git stash pop
}

Write-Host "4) 프론트 의존성 설치"
Set-Location $frontend
npm install

Write-Host "5) 프론트 빌드"
npm run build

if (!(Test-Path $dist)) { throw "dist 폴더가 생성되지 않았습니다: $dist" }

Write-Host "6) backend/static 반영"
if (!(Test-Path $static)) { New-Item -ItemType Directory -Path $static | Out-Null }
robocopy $dist $static /MIR | Out-Null
if ($LASTEXITCODE -gt 7) { throw "robocopy 실패 코드: $LASTEXITCODE" }

Write-Host "7) Git 커밋 + 푸시"
Set-Location $project
git add .
$pending = git status --porcelain
if ([string]::IsNullOrWhiteSpace($pending)) {
    Write-Host "커밋할 변경사항이 없습니다."
} else {
    git commit -m $commitMsg
    git push origin $branch
}

Write-Host "8) Cloudflare Pages 로그인 상태 확인"
Set-Location $frontend
npx --yes wrangler@4 whoami

Write-Host "9) Cloudflare Pages 수동 업로드"
npx --yes wrangler@4 pages deploy dist --project-name $pagesProject --branch $branch --commit-dirty=true

Write-Host "완료"
