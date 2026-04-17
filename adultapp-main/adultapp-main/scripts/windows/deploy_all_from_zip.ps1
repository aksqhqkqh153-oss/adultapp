param(
    [Parameter(Mandatory=$true)][string]$Zip,
    [string]$Repo = "C:\Users\최성규\Downloads\adultapp",
    [string]$Branch = "main",
    [string]$CommitMessage = "chore: apply adultapp safe forum update",
    [string]$PagesProjectName = "adultapp",
    [string]$BackendApiBaseUrl = "https://adultapp-production.up.railway.app/api",
    [string]$MobileWebFallbackUrl = "https://adultapp.pages.dev",
    [string]$AppReviewMode = "true",
    [switch]$SkipInstallIfNodeModulesExists
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $Repo)) { throw "Repo path not found: $Repo" }
if (-not (Test-Path $Zip)) { throw "Zip file not found: $Zip" }
if (-not (Test-Path (Join-Path $Repo '.git'))) { throw ".git not found in repo path: $Repo" }

Set-Location $Repo

git fetch origin
git checkout $Branch
git reset --hard ("origin/" + $Branch)
git clean -fd

Expand-Archive -LiteralPath $Zip -DestinationPath $Repo -Force

Write-Host "`n[1] ZIP 적용 후 변경 여부 확인"
git status --short

$hasChanges = git status --porcelain
if (-not $hasChanges) {
    Write-Host "변경사항이 없습니다."
    exit 0
}

git add .
Write-Host "`n[2] 스테이징 후 상태 확인"
git status

git commit -m $CommitMessage
git push origin $Branch

Write-Host "`n[3] 프론트 빌드"
Set-Location (Join-Path $Repo 'frontend')
$env:VITE_API_BASE_URL = $BackendApiBaseUrl
$env:VITE_APP_REVIEW_MODE = $AppReviewMode
$env:VITE_MOBILE_WEB_FALLBACK_URL = $MobileWebFallbackUrl

$nodeModulesPath = Join-Path (Get-Location) 'node_modules'
if ($SkipInstallIfNodeModulesExists -and (Test-Path $nodeModulesPath)) {
    Write-Host "node_modules 존재 -> npm install 생략"
} else {
    npm install
}

npm run build
if (-not (Test-Path (Join-Path (Get-Location) 'dist\index.html'))) {
    throw "dist build output missing: dist\\index.html"
}

Write-Host "`n[4] Cloudflare Pages 수동 업로드"
npx wrangler whoami
npx wrangler pages deploy dist --project-name $PagesProjectName --branch $Branch --commit-dirty=true

Write-Host "`n[5] 최종 상태"
Set-Location $Repo
git status
