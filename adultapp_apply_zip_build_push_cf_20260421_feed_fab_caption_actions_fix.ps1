$ErrorActionPreference = "Stop"

# =========================
# 고정값
# =========================
$project = "C:\Users\최성규\Downloads\adultapp"
$zip = "C:\Users\최성규\Downloads\adultapp_20260421_feed_fab_caption_actions_fix.zip"
$branch = "main"
$pagesProject = "adultapp"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$dist = Join-Path $frontend "dist"
$static = Join-Path $backend "static"
$commitMsg = "update: refine feed fab caption actions and share ui"

function Stop-IfRunning {
    param([string[]]$Names)

    Write-Host "1) 실행 중 프로세스 종료"
    foreach ($name in $Names) {
        $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
        if ($procs) {
            $procs | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host (" - 종료됨: " + $name)
        } else {
            Write-Host (" - 실행 중 아님: " + $name)
        }
    }
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path (Join-Path $project ".git"))) { throw ".git 폴더가 없습니다: $project" }

Stop-IfRunning -Names @("python","node","uvicorn")

Write-Host "2) ZIP 1차 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "3) Git 최신화 / 동기화"
Set-Location $project
git fetch origin
git checkout $branch
git reset --hard origin/$branch
git clean -fd

Write-Host "4) ZIP 2차 재덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "5) 프론트 빌드"
Set-Location $frontend
if (Test-Path ".\dist") { Remove-Item ".\dist" -Recurse -Force }
npm run build
if (!(Test-Path (Join-Path $dist "index.html"))) {
    throw "dist\index.html 파일이 없습니다: $dist"
}

Write-Host "6) backend/static 반영"
if (Test-Path $static) {
    Remove-Item $static -Recurse -Force
}
New-Item -ItemType Directory -Path $static | Out-Null
Copy-Item (Join-Path $dist "*") $static -Recurse -Force

Write-Host "7) Git 커밋 + 푸시 (Railway 자동 배포 트리거)"
Set-Location $project
git add .
$pending = git status --porcelain
if ([string]::IsNullOrWhiteSpace($pending)) {
    Write-Host " - 커밋할 변경사항이 없습니다."
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
