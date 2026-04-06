@echo off
REM Script para configurar GitHub Secrets usando GitHub CLI (Windows)
REM Ejecutar: setup-github-secrets.bat

echo 🔐 Configurando GitHub Secrets...

REM Verificar que gh este instalado
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ GitHub CLI (gh) no esta instalado.
    echo Instalalo desde: https://cli.github.com/
    pause
    exit /b 1
)

REM Verificar que estas logueado
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No estas logueado en GitHub. Ejecuta: gh auth login
    pause
    exit /b 1
)

REM Obtener el repositorio actual
for /f "tokens=*" %%i in ('gh repo view --json nameWithOwner -q .nameWithOwner') do set REPO=%%i
echo 📦 Repositorio: %REPO%

echo.
echo Ingresa los valores de los secrets (se ocultaran al escribir):
echo.

REM Fly.io Token
set /p FLY_API_TOKEN="FLY_API_TOKEN: "

REM Produccion
echo.
echo 📊 Produccion:
set /p DB_HOST="DB_HOST: "
set /p DB_USERNAME="DB_USERNAME: "
set /p DB_PASSWORD="DB_PASSWORD: "
set /p JWT_SECRET="JWT_SECRET: "
set /p JWT_REFRESH_SECRET="JWT_REFRESH_SECRET: "

REM Desarrollo
echo.
echo 🛠️  Desarrollo:
set /p DB_HOST_DEV="DB_HOST_DEV: "
set /p DB_USERNAME_DEV="DB_USERNAME_DEV: "
set /p DB_PASSWORD_DEV="DB_PASSWORD_DEV: "
set /p JWT_SECRET_DEV="JWT_SECRET_DEV: "
set /p JWT_REFRESH_SECRET_DEV="JWT_REFRESH_SECRET_DEV: "

REM QA
echo.
echo 🧪 QA:
set /p DB_HOST_QA="DB_HOST_QA: "
set /p DB_USERNAME_QA="DB_USERNAME_QA: "
set /p DB_PASSWORD_QA="DB_PASSWORD_QA: "
set /p JWT_SECRET_QA="JWT_SECRET_QA: "
set /p JWT_REFRESH_SECRET_QA="JWT_REFRESH_SECRET_QA: "

echo.
echo 📤 Configurando secrets en GitHub...

REM Configurar secrets
gh secret set FLY_API_TOKEN -b "%FLY_API_TOKEN%" -R "%REPO%"
gh secret set DB_HOST -b "%DB_HOST%" -R "%REPO%"
gh secret set DB_USERNAME -b "%DB_USERNAME%" -R "%REPO%"
gh secret set DB_PASSWORD -b "%DB_PASSWORD%" -R "%REPO%"
gh secret set JWT_SECRET -b "%JWT_SECRET%" -R "%REPO%"
gh secret set JWT_REFRESH_SECRET -b "%JWT_REFRESH_SECRET%" -R "%REPO%"

gh secret set DB_HOST_DEV -b "%DB_HOST_DEV%" -R "%REPO%"
gh secret set DB_USERNAME_DEV -b "%DB_USERNAME_DEV%" -R "%REPO%"
gh secret set DB_PASSWORD_DEV -b "%DB_PASSWORD_DEV%" -R "%REPO%"
gh secret set JWT_SECRET_DEV -b "%JWT_SECRET_DEV%" -R "%REPO%"
gh secret set JWT_REFRESH_SECRET_DEV -b "%JWT_REFRESH_SECRET_DEV%" -R "%REPO%"

gh secret set DB_HOST_QA -b "%DB_HOST_QA%" -R "%REPO%"
gh secret set DB_USERNAME_QA -b "%DB_USERNAME_QA%" -R "%REPO%"
gh secret set DB_PASSWORD_QA -b "%DB_PASSWORD_QA%" -R "%REPO%"
gh secret set JWT_SECRET_QA -b "%JWT_SECRET_QA%" -R "%REPO%"
gh secret set JWT_REFRESH_SECRET_QA -b "%JWT_REFRESH_SECRET_QA%" -R "%REPO%"

echo.
echo ✅ GitHub Secrets configurados exitosamente!
echo.
echo 📋 Secrets configurados:
echo    - FLY_API_TOKEN
echo    - DB_HOST, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET (Produccion)
echo    - DB_HOST_DEV, DB_USERNAME_DEV, DB_PASSWORD_DEV, JWT_SECRET_DEV, JWT_REFRESH_SECRET_DEV (Desarrollo)
echo    - DB_HOST_QA, DB_USERNAME_QA, DB_PASSWORD_QA, JWT_SECRET_QA, JWT_REFRESH_SECRET_QA (QA)
echo.
echo 🔗 Verifica en: https://github.com/%REPO%/settings/secrets/actions
pause
