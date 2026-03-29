@echo off
REM Script para copiar variables de entorno de producción a desarrollo (Windows)
REM Uso: copy-secrets-to-dev.bat

echo 📋 Copiando variables de entorno de producción a desarrollo

REM Verificar si flyctl está instalado
where flyctl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ flyctl no está instalado. Por favor, instálalo primero:
    echo    https://fly.io/docs/hands-on/install-flyctl/
    exit /b 1
)

REM Verificar si el usuario está autenticado
flyctl auth whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No estás autenticado en Fly.io. Ejecuta: flyctl auth login
    exit /b 1
)

echo ✅ flyctl está instalado y autenticado

REM Obtener secrets de producción
echo 📥 Obteniendo variables de producción (vevil-dtt7ta)...
flyctl secrets list -a vevil-dtt7ta --json > prod_secrets.json 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  No se encontraron variables de entorno en producción
    del prod_secrets.json 2>nul
    exit /b 0
)

echo 📤 Copiando variables a desarrollo (vevil-dev)...

REM Leer y copiar cada secret usando PowerShell
powershell -Command "$secrets = Get-Content 'prod_secrets.json' | ConvertFrom-Json; foreach ($secret in $secrets) { $name = $secret.Name; $value = $secret.Value; Write-Host \"   Configurando: $name\"; flyctl secrets set \"$name=$value\" -a vevil-dev }"

REM Limpiar archivo temporal
del prod_secrets.json 2>nul

echo.
echo ✅ ¡Variables de entorno copiadas exitosamente!
echo.
echo 📋 Variables configuradas en vevil-dev:
flyctl secrets list -a vevil-dev
