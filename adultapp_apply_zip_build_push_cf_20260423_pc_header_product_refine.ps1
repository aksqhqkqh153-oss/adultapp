$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260423_pc_header_product_refine.zip"
$branch = "main"
$commitMsg = "update: pc header product register refine"
$frontend = Join-Path $project "frontend"
$backendStatic = Join-Path $project "backend\static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"

Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Set-Location $project
if (!(Test-Path ".git")) { git init | Out-Null }
git fetch origin
git checkout $branch
git reset --hard ("origin/" + $branch)
git clean -fd
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Set-Location $frontend
npm run build

if (Test-Path $backendStatic) {
    Remove-Item $backendStatic -Recurse -Force
}
New-Item -ItemType Directory -Path $backendStatic -Force | Out-Null
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
npx --yes wrangler@4 pages deploy dist --project-name $cfProject --branch $branch --commit-dirty=true
