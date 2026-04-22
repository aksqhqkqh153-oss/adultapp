$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# =========================
# 기본 경로 / 설정
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260422_pc_dual_pane_independent_nav.zip"
$branch = "main"
$commitMsg = "update: add pc dual pane independent bottom navigation"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$backendStatic = Join-Path $backend "static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"
$stashName = "zip-overlay-sync-" + (Get-Date -Format "yyyyMMddHHmmss")

function Invoke-Wrangler {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & npx --yes wrangler@4 @Args
    return $LASTEXITCODE
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path $frontend)) { throw "frontend 폴더가 없습니다: $frontend" }
if (!(Test-Path $backend)) { throw "backend 폴더가 없습니다: $backend" }

Set-Location $project

# =========================
# 1) ZIP 덮어쓰기 (temp 없이 바로)
# =========================
Write-Host "1) ZIP 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

# =========================
# 2) Git 최신화 (ZIP 변경분 보존 후 동기화)
# =========================
Write-Host "2) Git 최신화 / 원격 동기화"
git add -A
$null = git stash push -u -m $stashName

$stashHit = git stash list | Select-String -SimpleMatch $stashName
$hasZipStash = $null -ne $stashHit

git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch 실패" }

git checkout $branch
if ($LASTEXITCODE -ne 0) { throw "git checkout 실패" }

git reset --hard ("origin/" + $branch)
if ($LASTEXITCODE -ne 0) { throw "git reset 실패" }

git clean -fd
if ($LASTEXITCODE -ne 0) { throw "git clean 실패" }

if ($hasZipStash) {
    git stash pop
    if ($LASTEXITCODE -ne 0) {
        throw "git stash pop 충돌 발생 - 충돌 파일 정리 후 다시 실행하세요"
    }
}

# =========================
# 3) 프론트 빌드
# =========================
Write-Host "3) 프론트 빌드"
Set-Location $frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "프론트 빌드 실패"
}

if (!(Test-Path $dist)) {
    throw "프론트 빌드 결과 dist 폴더가 없습니다: $dist"
}

# =========================
# 4) backend/static 반영
# =========================
Write-Host "4) backend/static 반영"
if (!(Test-Path $backendStatic)) {
    New-Item -ItemType Directory -Path $backendStatic -Force | Out-Null
}

robocopy $dist $backendStatic /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
$robocopyCode = $LASTEXITCODE
if ($robocopyCode -ge 8) {
    throw "backend/static 반영 실패(robocopy 종료코드: $robocopyCode)"
}

# =========================
# 5) Git 반영 + Push
# Railway adultapp backend 자동 배포 트리거
# =========================
Write-Host "5) Git 반영 + Push"
Set-Location $project
git add -A

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($changes | Out-String))) {
    Write-Host "커밋할 변경사항이 없습니다."
} else {
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { throw "git commit 실패" }

    git push origin $branch
    if ($LASTEXITCODE -ne 0) { throw "git push 실패" }
}

# =========================
# 6) Cloudflare Pages 로그인 확인 + 수동 업로드
# =========================
Write-Host "6) Cloudflare Pages 업로드"
Set-Location $frontend

Invoke-Wrangler whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Wrangler 로그인 세션 확인 필요"
    Invoke-Wrangler login
    if ($LASTEXITCODE -ne 0) {
        throw "Cloudflare Wrangler 로그인 실패"
    }
}

Invoke-Wrangler pages deploy dist --project-name $cfProject
if ($LASTEXITCODE -ne 0) {
    throw "Cloudflare Pages 업로드 실패"
}

Write-Host ""
Write-Host "완료:"
Write-Host "- ZIP 덮어쓰기 완료"
Write-Host "- Git 최신화 완료"
Write-Host "- 프론트 빌드 완료"
Write-Host "- backend/static 반영 완료"
Write-Host "- Git Push 완료 (Railway adultapp 배포 트리거)"
Write-Host "- Cloudflare Pages(adultapp) 업로드 완료"
