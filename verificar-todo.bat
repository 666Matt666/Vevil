@echo off
REM Script para verificar el estado completo del despliegue (Windows)

echo 🔍 Verificando estado del despliegue completo...
echo ==========================================
echo.

REM 1. Verificar Backend (Fly.io)
echo 1️⃣ BACKEND (Fly.io)
echo ─────────────────────────────────
set BACKEND_URL=https://vevil-dtt7ta.fly.dev/api
curl -s -o nul -w "%%{http_code}" %BACKEND_URL% --max-time 10 > temp_status.txt
set /p BACKEND_STATUS=<temp_status.txt
del temp_status.txt

if "%BACKEND_STATUS%"=="200" (
    echo ✅ Backend accesible
    echo    URL: %BACKEND_URL%
    echo    Status: %BACKEND_STATUS%
    
    REM Verificar API Docs
    curl -s -o nul -w "%%{http_code}" https://vevil-dtt7ta.fly.dev/api/docs --max-time 10 > temp_docs.txt
    set /p DOCS_STATUS=<temp_docs.txt
    del temp_docs.txt
    
    if "%DOCS_STATUS%"=="200" (
        echo    ✅ API Docs accesible
        echo    Docs: https://vevil-dtt7ta.fly.dev/api/docs
    ) else (
        echo    ⚠️  API Docs no accesible (Status: %DOCS_STATUS%)
    )
) else (
    echo ❌ Backend no responde
    echo    URL: %BACKEND_URL%
    echo    Status: %BACKEND_STATUS%
    echo    Error: No se pudo conectar al backend
)
echo.

REM 2. Verificar Frontend (Vercel)
echo 2️⃣ FRONTEND (Vercel)
echo ─────────────────────────────────
echo ⚠️  Verificación manual requerida
echo    Para verificar el frontend:
echo    1. Ve a https://vercel.com
echo    2. Busca tu proyecto
echo    3. Copia la URL de producción
echo    4. Verifica que esté accesible
echo.
echo    Si tienes la URL, ejecuta:
echo    curl https://TU-URL-VERCEL.vercel.app
echo.

REM 3. Verificar Base de Datos (Supabase)
echo 3️⃣ BASE DE DATOS (Supabase)
echo ─────────────────────────────────
echo ⚠️  Verificación manual requerida
echo    Para verificar la base de datos:
echo    1. Ve a https://supabase.com
echo    2. Selecciona tu proyecto
echo    3. Verifica que esté activo
echo.
echo    Para verificar desde el backend:
echo    flyctl logs -a vevil-dtt7ta ^| findstr /i "error connection"
echo.

REM Resumen
echo ==========================================
echo 📊 RESUMEN
echo ==========================================

if "%BACKEND_STATUS%"=="200" (
    echo ✅ Backend: Funcionando
) else if "%BACKEND_STATUS%"=="404" (
    echo ✅ Backend: Funcionando
) else (
    echo ❌ Backend: No responde
)

echo ⚠️  Frontend: Verificar manualmente
echo ⚠️  Base de Datos: Verificar manualmente
echo.
echo 📖 Para más detalles, revisa: VERIFICAR-ESTADO.md
echo.

pause

