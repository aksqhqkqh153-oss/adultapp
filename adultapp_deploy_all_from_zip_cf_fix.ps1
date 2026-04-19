param(
    [Parameter(Mandatory=$true)][string]$Zip,
    [string]$Repo = "C:\adultapp",
    [string]$Branch = "main",
    [string]$CommitMessage = "update: fix stable cloudflare manual deploy",
    [string]$PagesProjectName = "adultapp",
    [string]$BackendApiBaseUrl = "https://adultapp-production.up.railway.app/api",
    [string]$MobileWebFallbackUrl = "https://adultapp.pages.dev",
    [string]$AppReviewMode = "true",
    [switch]$SkipInstallIfNodeModulesExists
)

$ErrorActionPreference = "Stop"

function Invoke-Wrangler {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & npx --yes wrangler@4 @Args
    return $LASTEXITCODE
}

if (-not (Test-Path $Repo)) { throw "Repo path not found: $Repo" }
if (-not (Test-Path $Zip)) { throw "Zip file not found: $Zip" }
if (-not (Test-Path (Join-Path $Repo ".git"))) { throw ".git not found in repo path: $Repo" }

Write-Host "[1/6] stopping running processes"
Get-Process python,node,npm,uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
cmd /c "taskkill /F /IM python.exe /T >nul 2>&1" | Out-Null
cmd /c "taskkill /F /IM node.exe /T >nul 2>&1" | Out-Null
cmd /c "taskkill /F /IM npm.cmd /T >nul 2>&1" | Out-Null
cmd /c "taskkill /F /IM uvicorn.exe /T >nul 2>&1" | Out-Null

Set-Location $Repo

Write-Host "[2/6] syncing git"
git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch failed" }
git checkout $Branch
if ($LASTEXITCODE -ne 0) { throw "git checkout failed" }
git reset --hard ("origin/" + $Branch)
if ($LASTEXITCODE -ne 0) { throw "git reset failed" }
git clean -fd
if ($LASTEXITCODE -ne 0) { throw "git clean failed" }

Write-Host "[3/6] applying zip directly into repo"
Expand-Archive -LiteralPath $Zip -DestinationPath $Repo -Force
if (-not (Test-Path (Join-Path $Repo "frontend\package.json"))) {
    throw "frontend\\package.json missing after zip extraction"
}

git status --short
$hasChanges = git status --porcelain
if (-not $hasChanges) {
    Write-Host "No changes detected after zip extraction."
    exit 0
}

Write-Host "[4/6] git add / commit / push"
git add .
if ($LASTEXITCODE -ne 0) { throw "git add failed" }
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
git push origin $Branch
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

Write-Host "[5/6] frontend build"
$frontendPath = Join-Path $Repo "frontend"
Set-Location $frontendPath
$env:VITE_API_BASE_URL = $BackendApiBaseUrl
$env:VITE_APP_REVIEW_MODE = $AppReviewMode
$env:VITE_MOBILE_WEB_FALLBACK_URL = $MobileWebFallbackUrl

$nodeModulesPath = Join-Path $frontendPath "node_modules"
if ($SkipInstallIfNodeModulesExists -and (Test-Path $nodeModulesPath)) {
    Write-Host "node_modules detected -> skipping npm install"
} else {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}

npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
if (-not (Test-Path (Join-Path $frontendPath "dist\index.html"))) {
    throw "dist build output missing: dist\\index.html"
}

Write-Host "[6/6] Cloudflare Pages deploy"
Invoke-Wrangler whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Wrangler login required. Browser login will open once."
    Invoke-Wrangler login | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "wrangler login failed" }
}
Invoke-Wrangler pages deploy dist --project-name $PagesProjectName --branch $Branch --commit-dirty=true | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Pages deploy failed" }

Write-Host "Done."
Set-Location $Repo
git status
