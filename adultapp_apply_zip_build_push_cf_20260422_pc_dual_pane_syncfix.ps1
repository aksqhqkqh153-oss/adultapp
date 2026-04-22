$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# =========================
# 기본 경로 / 설정
# =========================
$project = "C:\Users\icj24\Downloads\adultapp"
$zip = "C:\Users\icj24\Downloads\adultapp_20260422_pc_dual_pane_syncfix.zip"
$branch = "main"
$commitMsg = "update: add pc dual pane independent bottom navigation"
$frontend = Join-Path $project "frontend"
$backend = Join-Path $project "backend"
$backendStatic = Join-Path $backend "static"
$dist = Join-Path $frontend "dist"
$cfProject = "adultapp"

function Invoke-Wrangler {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & npx --yes wrangler@4 @Args
    return $LASTEXITCODE
}

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
            throw "ZIP 구조 오류: 중간 폴더 'adultapp-main' 이 포함되어 있습니다. 중간 폴더 없이 다시 압축한 ZIP만 사용하세요."
        }
    }
    finally {
        $archive.Dispose()
    }
}

if (!(Test-Path $project)) { throw "프로젝트 폴더가 없습니다: $project" }
if (!(Test-Path $zip)) { throw "ZIP 파일이 없습니다: $zip" }
if (!(Test-Path $frontend)) { throw "frontend 폴더가 없습니다: $frontend" }
if (!(Test-Path $backend)) { throw "backend 폴더가 없습니다: $backend" }

Test-ZipLayout -ZipPath $zip

Set-Location $project

# =========================
# 1) ZIP 1차 덮어쓰기
#    - 사용자가 요청한 순서 유지
# =========================
Write-Host "1) ZIP 1차 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

# =========================
# 2) Git 최신화
#    - stash/pop 없이 원격 최신 상태로 강제 동기화
# =========================
Write-Host "2) Git 최신화"
git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch 실패" }

git checkout $branch
if ($LASTEXITCODE -ne 0) { throw "git checkout 실패" }

git reset --hard ("origin/" + $branch)
if ($LASTEXITCODE -ne 0) { throw "git reset 실패" }

git clean -fd
if ($LASTEXITCODE -ne 0) { throw "git clean 실패" }

# =========================
# 3) ZIP 2차 덮어쓰기
#    - reset/clean 이후 수정본을 다시 정확히 반영
#    - stash 충돌 방지 핵심
# =========================
Write-Host "3) ZIP 2차 덮어쓰기"
Expand-Archive -LiteralPath $zip -DestinationPath $project -Force

# =========================
# 4) 프론트 빌드
# =========================
Write-Host "4) 프론트 빌드"
Set-Location $frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "프론트 빌드 실패"
}

if (!(Test-Path $dist)) {
    throw "dist 폴더가 없습니다: $dist"
}

# =========================
# 5) backend/static 반영
# =========================
Write-Host "5) backend/static 반영"
if (!(Test-Path $backendStatic)) {
    New-Item -ItemType Directory -Path $backendStatic -Force | Out-Null
}

robocopy $dist $backendStatic /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
$robocopyCode = $LASTEXITCODE
if ($robocopyCode -ge 8) {
    throw "backend/static 반영 실패(robocopy 종료코드: $robocopyCode)"
}

# =========================
# 6) Git 반영 + Push
#    - Railway Git 연동 배포 트리거
# =========================
Write-Host "6) Git 반영 + Push"
Set-Location $project
git add -A

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($changes | Out-String))) {
    Write-Host "커밋할 변경사항이 없습니다."
}
else {
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { throw "git commit 실패" }

    git push origin $branch
    if ($LASTEXITCODE -ne 0) { throw "git push 실패" }
}

# =========================
# 7) Cloudflare Pages 업로드
# =========================
Write-Host "7) Cloudflare Pages 업로드"
Set-Location $frontend

Invoke-Wrangler whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Wrangler 로그인 필요 - 브라우저에서 로그인 진행"
    Invoke-Wrangler login
    if ($LASTEXITCODE -ne 0) {
        throw "Cloudflare Wrangler 로그인 실패"
    }
}

Invoke-Wrangler pages deploy dist --project-name $cfProject
if ($LASTEXITCODE -ne 0) {
    throw "Cloudflare Pages 업로드 실패"
}

Write-Host ""
Write-Host "완료: ZIP 덮어쓰기 / Git 최신화 / 프론트 빌드 / backend/static 반영 / Git Push / Cloudflare Pages 업로드"
