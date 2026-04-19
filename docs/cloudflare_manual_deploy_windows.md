# Cloudflare Pages manual deploy (Windows PowerShell 5.1)

## Recommended script
- Repo script: `scripts/windows/deploy_all_from_zip.ps1`
- Root copy: `adultapp_deploy_all_from_zip_cf_fix.ps1`

## One-shot command
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\최성규\Downloads\adultapp\adultapp_deploy_all_from_zip_cf_fix.ps1" `
  -Zip "C:\Users\최성규\Downloads\adultapp_YYYYMMDD_cf_fix.zip" `
  -Repo "C:\Users\최성규\Downloads\adultapp" `
  -Branch "main" `
  -CommitMessage "update: fix stable cloudflare manual deploy" `
  -PagesProjectName "adultapp" `
  -BackendApiBaseUrl "https://adultapp-production.up.railway.app/api"
```

## What this script does
1. Stops running node/python/npm/uvicorn processes.
2. Runs `git fetch`, `checkout`, `reset --hard`, `clean -fd`.
3. Extracts ZIP directly into repo root.
4. Runs `git add`, `commit`, `push`.
5. Runs `npm install` and `npm run build`.
6. Runs `wrangler whoami`, opens `wrangler login` only if needed, then deploys to Cloudflare Pages.

## Manual frontend-only deploy
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\최성규\Downloads\adultapp\scripts\windows\cloudflare_pages_manual_deploy.ps1" `
  -Repo "C:\Users\최성규\Downloads\adultapp" `
  -BackendApiBaseUrl "https://adultapp-production.up.railway.app/api" `
  -PagesProjectName "adultapp" `
  -Branch "main"
```

## Notes
- The scripts use ASCII-only output to avoid PowerShell 5.1 encoding parse issues.
- The scripts use `npx --yes wrangler@4` so a missing local wrangler install does not block deployment.
- Existing Cloudflare Pages project linkage is reused; the scripts do not create or relink a project.
