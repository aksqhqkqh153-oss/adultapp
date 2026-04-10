param(
    [Parameter(Mandatory=$true)][string]$Zip,
    [string]$Repo = "C:\Users\icj24\Downloads\adultapp",
    [string]$Branch = "main",
    [string]$CommitMessage = "chore: apply adultapp zip update"
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

git status --short

$hasChanges = git status --porcelain
if (-not $hasChanges) {
    Write-Host "No file changes detected after ZIP apply."
    exit 0
}

git add .
git status

git commit -m $CommitMessage
git push origin $Branch

git status
