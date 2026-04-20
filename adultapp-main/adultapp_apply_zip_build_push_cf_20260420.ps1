$ErrorActionPreference = "Stop"

# =========================
# 고정값
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260420_feed_alignment_toolbar_center_fix.zip"
$branch = "main"
$pagesProject = "adultapp"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$dist = Join-Path $frontend "dist"
$static = Join-Path $backend "static"
$commitMsg = "update: refine feed community chat toolbar alignment"

function Stop-RunningProcesses {
    Write-Host "1) 실행 중 프로세스 종료"
    Get-Process python,node,npm,uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path (Join-Path $project ".git"))) { throw ".git 폴더가 없습니다: $project" }

Stop-RunningProcesses

Write-Host "2) ZIP 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "3) Git 최신화"
Set-Location $project
git fetch origin
git checkout $branch
git reset --hard origin/$branch
git clean -fd

Write-Host "4) ZIP 재덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "5) 프론트 빌드"
Set-Location $frontend
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

Write-Host "8) Cloudflare 로그인 상태 확인"
Set-Location $frontend
npx --yes wrangler@4 whoami

Write-Host "9) Cloudflare Pages 수동 업로드"
npx --yes wrangler@4 pages deploy dist --project-name $pagesProject --branch $branch --commit-dirty=true

Write-Host "완료"
