$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# =========================
# 기본 경로 / 설정
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260422_mime_module_fix.zip"
$branch = "main"
$commitMsg = "update: fix module script mime mismatch on app entry"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$backendStatic = Join-Path $backend "static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"

function Test-ZipLayout {
    param([string]$ZipPath)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        $topNames = New-Object 'System.Collections.Generic.HashSet[string]'
        foreach ($entry in $archive.Entries) {
            if ([string]::IsNullOrWhiteSpace($entry.FullName)) { continue }
            $normalized = $entry.FullName.Replace('\\', '/')
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
            throw "ZIP 구조 오류: 중간 폴더가 포함되어 있습니다. 중간 폴더 없이 다시 압축한 ZIP만 사용하세요."
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
    if ($LASTEXITCODE -ne 0) {
        throw "기존 Git 상태 정리 실패"
    }

    & git clean -fd | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "기존 Git 미정리 파일 삭제 실패"
    }
}

function Test-BuildOutput {
    param([string]$DistPath)

    $distIndex = Join-Path $DistPath "index.html"
    if (!(Test-Path $distIndex)) {
        throw "dist/index.html 이 없습니다."
    }

    $content = Get-Content $distIndex -Raw
    if ($content -match '/src/main\.tsx') {
        throw "배포 금지: dist/index.html 이 개발용 엔트리(/src/main.tsx)를 참조하고 있습니다."
    }

    $matches = [regex]::Matches($content, '<script[^>]+type="module"[^>]+src="([^"]+)"')
    if ($matches.Count -lt 1) {
        throw "배포 금지: dist/index.html 에 module script 가 없습니다."
    }

    foreach ($match in $matches) {
        $src = $match.Groups[1].Value
        $relative = $src.TrimStart('/')
        $filePath = Join-Path $DistPath $relative
        if (!(Test-Path $filePath)) {
            throw "배포 금지: dist/index.html 이 참조하는 파일이 없습니다: $src"
        }
    }

    foreach ($required in @('assets/index.js','assets/index.css','version.json','_headers','_redirects')) {
        $requiredPath = Join-Path $DistPath $required
        if (!(Test-Path $requiredPath)) {
            throw "배포 금지: 필수 산출물이 없습니다: $required"
        }
    }
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path $frontend)) { throw "frontend 폴더가 없습니다: $frontend" }
if (!(Test-Path $backend)) { throw "backend 폴더가 없습니다: $backend" }

Test-ZipLayout -ZipPath $zip

Write-Host "0) 이전 Git 상태 정리"
Reset-GitState -RepoPath $project

Set-Location $project

Write-Host "1) Git 최신화 (새 PC 동기화)"
& git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch 실패" }

& git checkout $branch
if ($LASTEXITCODE -ne 0) { throw "git checkout 실패" }

& git reset --hard ("origin/" + $branch)
if ($LASTEXITCODE -ne 0) { throw "git reset 실패" }

& git clean -fd
if ($LASTEXITCODE -ne 0) { throw "git clean 실패" }

Write-Host "2) ZIP 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

Write-Host "3) 프론트 빌드"
Set-Location $frontend
& npm run build
if ($LASTEXITCODE -ne 0) { throw "프론트 빌드 실패" }

Test-BuildOutput -DistPath $dist

Write-Host "4) backend/static 반영"
if (!(Test-Path $backendStatic)) {
    New-Item -ItemType Directory -Path $backendStatic -Force | Out-Null
}

& robocopy $dist $backendStatic /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
$robocopyCode = $LASTEXITCODE
if ($robocopyCode -ge 8) {
    throw "backend/static 반영 실패(robocopy 종료코드: $robocopyCode)"
}

Write-Host "5) Git 반영 / Push"
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

Write-Host "6) Cloudflare Pages 수동 업로드"
Set-Location $frontend
& npx wrangler pages deploy dist --project-name $cfProject
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Pages 업로드 실패" }

Write-Host ""
Write-Host "완료: Git 최신화 -> ZIP 덮어쓰기 -> 프론트 빌드 -> backend/static 반영 -> Git 반영/Push -> Cloudflare Pages 수동 업로드"
