param(
  [Parameter(Mandatory=$true)][string]$BackendApiBaseUrl,
  [string]$PagesProjectName = "adultapp",
  [string]$BranchName = "main"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"

Push-Location $frontendDir
try {
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm not found" }
  npm install
  $env:VITE_API_BASE_URL = $BackendApiBaseUrl
  if (-not $env:VITE_APP_REVIEW_MODE) { $env:VITE_APP_REVIEW_MODE = "true" }
  if (-not $env:VITE_MOBILE_WEB_FALLBACK_URL) { $env:VITE_MOBILE_WEB_FALLBACK_URL = "https://m.example.com/safe" }
  npm run cf:build
  npx wrangler login
  npx wrangler pages deploy dist --project-name $PagesProjectName --branch $BranchName --commit-dirty=true
}
finally {
  Pop-Location
}
