# adultapp settings logout update 2026-04-12

## change summary
- settings overlay top category area now shows a dedicated `로그아웃` button above `일반`
- logout resets demo login, identity/adult verification, signup draft, seller verification draft, and account-private state
- logout returns the app to the signup / identity gate flow so re-login testing can continue immediately

## local checks
- frontend build passed
- backend self-test routes remained intact

## windows powershell 5.1 apply zip
```powershell
$repo = "C:\Users\최성규\Downloads\adultapp"
$zip = "C:\Users\최성규\Downloads\adultapp_logout_settings_update_20260412.zip"

Set-Location $repo
Expand-Archive -LiteralPath $zip -DestinationPath $repo -Force

git status
```

## cloudflare pages manual upload
```powershell
Set-Location "C:\Users\최성규\Downloads\adultapp\frontend"
if (Test-Path .\node_modules) {
  npm run build
} else {
  npm install
  npm run build
}
```

After build, upload `frontend\dist` in the Cloudflare Pages dashboard.
