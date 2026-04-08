@echo off
setlocal
if "%~1"=="" (
  echo Usage: cloudflare_manual_deploy.cmd https://your-railway-domain.up.railway.app/api [project_name]
  exit /b 1
)
set BACKEND_API_BASE_URL=%~1
set PAGES_PROJECT_NAME=%~2
if "%PAGES_PROJECT_NAME%"=="" set PAGES_PROJECT_NAME=adultapp
powershell -ExecutionPolicy Bypass -File "%~dp0cloudflare_manual_deploy.ps1" -BackendApiBaseUrl "%BACKEND_API_BASE_URL%" -PagesProjectName "%PAGES_PROJECT_NAME%"
endlocal
