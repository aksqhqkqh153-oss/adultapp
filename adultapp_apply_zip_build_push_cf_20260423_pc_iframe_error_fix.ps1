$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$project = "C:\Users\최성규\Downloads\adultapp"
$zip = "C:\Users\최성규\Downloads\adultapp_20260423_pc_iframe_error_fix.zip"
$branch = "main"
$commitMsg = "update: fix pc iframe pane loading error"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$backendStatic = Join-Path $backend "static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"

Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Set-Location $project
git fetch origin
git checkout $branch
git reset --hard ("origin/" + $branch)
git clean -fd
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Set-Location $frontend
npm run build

if (!(Test-Path $backendStatic)) {
    New-Item -ItemType Directory -Path $backendStatic -Force | Out-Null
}
robocopy $dist $backendStatic /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "backend/static 반영 실패" }

Set-Location $project
git add -A
$changes = git status --porcelain
if (-not [string]::IsNullOrWhiteSpace(($changes | Out-String))) {
    git commit -m $commitMsg
    git push origin $branch
}

Set-Location $frontend
npx --yes wrangler@4 whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    npx --yes wrangler@4 login
}
npx --yes wrangler@4 pages deploy dist --project-name $cfProject
