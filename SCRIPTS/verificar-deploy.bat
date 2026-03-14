@echo off
REM Script para verificar el estado del despliegue de Vevil System (Windows)

echo 🔍 Verificando estado del despliegue...
echo.

REM 1. Verificar Backend (Render)
echo 1️⃣ Verificando Backend (Render)...
curl -s -o nul -w "%%{http_code}" https://evil-backend.onrender.com/api > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo ✅ Backend accesible en: https://evil-backend.onrender.com/api
    echo    📚 API Docs: https://evil-backend.onrender.com/api/docs
) else if "%STATUS%"=="404" (
    echo ✅ Backend accesible en: https://evil-backend.onrender.com/api
    echo    📚 API Docs: https://evil-backend.onrender.com/api/docs
) else (
    echo ❌ Backend no responde correctamente
)
echo.

REM 2. Verificar Frontend (Vercel)
echo 2️⃣ Verificando Frontend (Vercel)...
echo ⚠️  Necesitas verificar manualmente en Vercel:
echo    - Ve a https://vercel.com y verifica tu proyecto
echo    - Verifica que la variable VITE_API_URL esté configurada
echo.

REM 3. Verificar Base de Datos
echo 3️⃣ Verificando Base de Datos (Supabase)...
echo ⚠️  Necesitas verificar manualmente:
echo    - Ve a https://supabase.com y verifica tu proyecto
echo    - Verifica que las variables de entorno en Render estén configuradas
echo.

REM 4. Variables de Entorno necesarias
echo 4️⃣ Variables de Entorno necesarias:
echo.
echo 📦 En Render (Backend):
echo    - DB_HOST=...pooler.supabase.com (o db.xxx.supabase.co)
echo    - DB_PORT=5432
echo    - DB_USERNAME=postgres
echo    - DB_PASSWORD=tu_password_supabase
echo    - DB_DATABASE=postgres
echo    - JWT_SECRET=tu_clave_secreta
echo.
echo 📦 En Vercel (Frontend):
echo    - VITE_API_URL=https://evil-backend.onrender.com/api
echo.

echo ✅ Verificación completa!
echo.
echo 📖 Para más detalles, revisa: CHECKLIST-DEPLOY.md

pause











