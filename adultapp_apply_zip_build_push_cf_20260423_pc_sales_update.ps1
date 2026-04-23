$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$project = "C:\Users\최성규\Downloads\adultapp"
$zip = "C:\Users\최성규\Downloads\adultapp_20260423_pc_dualpane_sales_update.zip"
$branch = "main"
$commitMsg = "update: pc dual pane menu product settlement refresh"
$frontend = Join-Path $project "frontend"
$backendStatic = Join-Path $project "backend\static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"

# ZIP 덮어쓰기
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

# Git 최신화
Set-Location $project
git fetch origin
git checkout $branch
git reset --hard ("origin/" + $branch)
git clean -fd
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

# 프론트 빌드
Set-Location $frontend
npm run build

# backend/static 반영
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

# Cloudflare Pages 업로드
Set-Location $frontend
npx --yes wrangler@4 pages deploy dist --project-name $cfProject --branch $branch --commit-dirty=true
