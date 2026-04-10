param(
    [Parameter(Mandatory=$true)][string]$BackendApiBaseUrl,
    [string]$Repo = "C:\Users\icj24\Downloads\adultapp",
    [string]$FrontendDir = "frontend",
    [string]$PagesProjectName = "adultapp",
    [string]$Branch = "main",
    [string]$MobileWebFallbackUrl = "https://adultapp.pages.dev",
    [string]$AppReviewMode = "true",
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
$frontendPath = Join-Path $Repo $FrontendDir
if (-not (Test-Path $frontendPath)) { throw "Frontend path not found: $frontendPath" }

Set-Location $frontendPath
$env:VITE_API_BASE_URL = $BackendApiBaseUrl
$env:VITE_APP_REVIEW_MODE = $AppReviewMode
$env:VITE_MOBILE_WEB_FALLBACK_URL = $MobileWebFallbackUrl

if (-not $SkipInstall) {
    npm install
} elseif (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    throw "SkipInstall was used but node_modules does not exist."
}

npm run build
if (-not (Test-Path (Join-Path $frontendPath 'dist\index.html'))) {
    throw "dist build output missing: dist\\index.html"
}

npx wrangler whoami
npx wrangler pages deploy dist --project-name $PagesProjectName --branch $Branch --commit-dirty=true
