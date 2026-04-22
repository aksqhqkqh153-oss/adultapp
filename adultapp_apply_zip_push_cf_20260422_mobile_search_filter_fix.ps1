$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# =========================
# 기본 경로 / 설정
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260422_mobile_search_filter_fix.zip"
$branch = "main"
$commitMsg = "update: fix mobile shop search filter toggle layout"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$dist = Join-Path $frontend "dist"
$backendStatic = Join-Path $backend "static"
$cfProject = "adultapp"

function Test-ZipLayout {
    param([string]$ZipPath)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        $topNames = New-Object 'System.Collections.Generic.HashSet[string]'
        foreach ($entry in $archive.Entries) {
            if ([string]::IsNullOrWhiteSpace($entry.FullName)) { continue }
            $normalized = $entry.FullName.Replace('\', '/')
            $trimmed = $normalized.Trim('/')
            if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
            $top = ($trimmed -split '/')[0]
            if (-not [string]::IsNullOrWhiteSpace($top)) {
                [void]$topNames.Add($top)
            }
        }

        if (-not ($topNames.Contains('frontend') -and $topNames.Contains('backend'))) {
            throw "ZIP 구조 오류: 압축을 풀면 프로젝트 루트에서 바로 frontend / backend 폴더가 보여야 합니다."
        }

        if ($topNames.Contains('adultapp-main')) {
            throw "ZIP 구조 오류: 중간 폴더 'adultapp-main' 이 포함되어 있습니다."
        }
    }
    finally {
        $archive.Dispose()
    }
}

function Reset-GitState {
    param([string]$RepoPath)

    Set-Location $RepoPath
    $gitDir = Join-Path $RepoPath ".git"

    if (Test-Path (Join-Path $gitDir "index.lock")) {
        Remove-Item (Join-Path $gitDir "index.lock") -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path (Join-Path $gitDir "MERGE_HEAD")) {
        cmd /c "git merge --abort >nul 2>nul"
    }

    if ((Test-Path (Join-Path $gitDir "REBASE_HEAD")) -or
        (Test-Path (Join-Path $gitDir "rebase-apply")) -or
        (Test-Path (Join-Path $gitDir "rebase-merge"))) {
        cmd /c "git rebase --abort >nul 2>nul"
    }

    if (Test-Path (Join-Path $gitDir "CHERRY_PICK_HEAD")) {
        cmd /c "git cherry-pick --abort >nul 2>nul"
    }

    if (Test-Path (Join-Path $gitDir "rebase-apply")) {
        cmd /c "git am --abort >nul 2>nul"
    }

    & git reset --hard HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "기존 Git 상태 정리 실패" }

    & git clean -fd | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "기존 Git 미정리 파일 삭제 실패" }
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path $frontend)) { throw "frontend 폴더가 없습니다: $frontend" }
if (!(Test-Path $backend)) { throw "backend 폴더가 없습니다: $backend" }

Test-ZipLayout -ZipPath $zip

Write-Host "0) 이전 Git 상태 정리"
Reset-GitState -RepoPath $project

Set-Location $project

Write-Host "1) ZIP 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "2) Git 최신화"
& git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch 실패" }

& git checkout $branch
if ($LASTEXITCODE -ne 0) { throw "git checkout 실패" }

& git reset --hard ("origin/" + $branch)
if ($LASTEXITCODE -ne 0) { throw "git reset 실패" }

& git clean -fd
if ($LASTEXITCODE -ne 0) { throw "git clean 실패" }

Write-Host "3) ZIP 재덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

if (!(Test-Path $dist)) { throw "dist 폴더가 없습니다: $dist" }
if (!(Test-Path $backendStatic)) { throw "backend/static 폴더가 없습니다: $backendStatic" }

Write-Host "4) Git 반영 / Push"
Set-Location $project
& git add -A

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($changes | Out-String))) {
    Write-Host "커밋할 변경사항이 없습니다."
}
else {
    & git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { throw "git commit 실패" }

    & git push origin $branch
    if ($LASTEXITCODE -ne 0) { throw "git push 실패" }
}

Write-Host "5) Cloudflare Pages 수동 업로드"
Set-Location $frontend
& npx wrangler pages deploy dist --project-name $cfProject
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Pages 업로드 실패" }

Write-Host ""
Write-Host "완료: ZIP 덮어쓰기 -> Git 최신화(백엔드 배포 트리거) -> Git 반영 / Push -> Cloudflare Pages 수동 업로드"
