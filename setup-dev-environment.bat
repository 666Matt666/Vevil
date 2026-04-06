@echo off
REM Script para configurar el ambiente de desarrollo en Fly.io (Windows)
REM Uso: setup-dev-environment.bat

echo 🚀 Configurando ambiente de desarrollo para Vevil System

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

REM Crear la app de desarrollo si no existe
flyctl apps list | findstr "vevil-dev" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Creando app de desarrollo: vevil-dev
    flyctl apps create vevil-dev
    echo ✅ App vevil-dev creada exitosamente
) else (
    echo ℹ️  La app vevil-dev ya existe
)

REM Desplegar la app de desarrollo
echo 🚀 Desplegando app de desarrollo...
flyctl deploy --config fly.dev.toml

echo.
echo ✅ ¡Ambiente de desarrollo configurado exitosamente!
echo.
echo 📋 Información del ambiente:
echo    - App: vevil-dev
echo    - URL: https://vevil-dev.fly.dev
echo    - Configuración: fly.dev.toml
echo.
echo 📚 Próximos pasos:
echo    1. Configura las variables de entorno necesarias:
echo       flyctl secrets set VARIABLE_NAME=value -a vevil-dev
echo.
echo    2. Crea la rama de desarrollo:
echo       git checkout -b develop
echo.
echo    3. Haz push a la rama develop para desplegar automáticamente:
echo       git push origin develop
echo.
echo 📖 Para más información, consulta: vevil-system\DEPLOYMENT.md
