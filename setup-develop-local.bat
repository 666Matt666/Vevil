@echo off
REM Script para configurar el entorno de desarrollo local usando Supabase en la nube
REM Ejecutar: setup-develop-local.bat

echo 🚀 Configurando entorno de desarrollo local con Supabase en la nube...

REM Verificar que estamos en el directorio correcto
if not exist "backend-vevil" (
    echo ❌ Error: Ejecuta este script desde el directorio vevil-system
    pause
    exit /b 1
)

REM Configurar Backend
echo.
echo 📦 Configurando Backend...
cd backend-vevil

if exist ".env" (
    echo ⚠️  Ya existe un archivo .env en backend-vevil
    set /p overwrite="¿Deseas sobreescribirlo? (s/n): "
    if /i not "%overwrite%"=="s" (
        echo ⏭️  Manteniendo .env existente
    ) else (
        copy .env.development.example .env
        echo ✅ .env creado desde .env.development.example
    )
) else (
    copy .env.development.example .env
    echo ✅ .env creado desde .env.development.example
)

echo.
echo 📝 Configura las credenciales de Supabase en backend-vevil\.env:
echo    1. Ve a https://supabase.com/dashboard
echo    2. Selecciona tu proyecto de desarrollo
echo    3. Ve a Settings → Database
echo    4. Copia las credenciales a .env:
echo       - DB_HOST
echo       - DB_USERNAME
echo       - DB_PASSWORD
echo.
echo    También configura:
echo       - JWT_SECRET (genera uno nuevo)
echo       - JWT_REFRESH_SECRET (genera uno nuevo)
echo.

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
call npm install

cd ..

REM Configurar Frontend
echo.
echo 📦 Configurando Frontend...
cd frontend-vevil 2>nul || cd ..\frontend-vevil 2>nul || (
    echo ⚠️  No se encontró el directorio frontend-vevil
    echo    Asegúrate de tener el frontend configurado
    cd ..
    goto :skip_frontend
)

if exist ".env" (
    echo ⚠️  Ya existe un archivo .env en frontend-vevil
    set /p overwrite="¿Deseas sobreescribirlo? (s/n): "
    if /i not "%overwrite%"=="s" (
        echo ⏭️  Manteniendo .env existente
    ) else (
        echo VITE_API_URL=http://localhost:3000/api > .env
        echo ✅ .env creado para frontend
    )
) else (
    echo VITE_API_URL=http://localhost:3000/api > .env
    echo ✅ .env creado para frontend
)

REM Instalar dependencias del frontend
echo.
echo 📦 Instalando dependencias del frontend...
call npm install

cd ..

:skip_frontend

echo.
echo ✅ Configuración completada!
echo.
echo 📋 Para levantar el entorno de desarrollo:
echo.
echo    Terminal 1 (Backend):
echo    cd vevil-system\backend-vevil
echo    npm run start:dev
echo.
echo    Terminal 2 (Frontend):
echo    cd vevil-system\frontend-vevil
echo    npm run dev
echo.
echo 🌐 URLs locales:
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5173
echo.
echo 📊 Base de datos: Supabase en la nube (desarrollo)
pause
