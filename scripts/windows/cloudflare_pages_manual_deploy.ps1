param(
    [Parameter(Mandatory=$true)][string]$BackendApiBaseUrl,
    [string]$Repo = "C:\adultapp",
    [string]$FrontendDir = "frontend",
    [string]$PagesProjectName = "adultapp",
    [string]$Branch = "main",
    [string]$MobileWebFallbackUrl = "https://adultapp.pages.dev",
    [string]$AppReviewMode = "true",
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Invoke-Wrangler {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & npx --yes wrangler@4 @Args
    return $LASTEXITCODE
}

$frontendPath = Join-Path $Repo $FrontendDir
if (-not (Test-Path $frontendPath)) { throw "Frontend path not found: $frontendPath" }

Set-Location $frontendPath
$env:VITE_API_BASE_URL = $BackendApiBaseUrl
$env:VITE_APP_REVIEW_MODE = $AppReviewMode
$env:VITE_MOBILE_WEB_FALLBACK_URL = $MobileWebFallbackUrl

Write-Host "[CF] frontend path: $frontendPath"

if (-not $SkipInstall) {
    Write-Host "[CF] npm install"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
} elseif (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    throw "SkipInstall was used but node_modules does not exist."
}

Write-Host "[CF] npm run build"
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

if (-not (Test-Path (Join-Path $frontendPath "dist\index.html"))) {
    throw "dist build output missing: dist\\index.html"
}

Write-Host "[CF] checking wrangler login"
Invoke-Wrangler whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[CF] wrangler login required"
    Invoke-Wrangler login | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "wrangler login failed" }
}

Write-Host "[CF] deploying to Cloudflare Pages"
Invoke-Wrangler pages deploy dist --project-name $PagesProjectName --branch $Branch --commit-dirty=true | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Pages deploy failed" }

Write-Host "[CF] deploy completed"
