#!/bin/bash
# Script para configurar el entorno de desarrollo local usando Supabase en la nube
# Ejecutar: bash setup-develop-local.sh

set -e

echo "🚀 Configurando entorno de desarrollo local con Supabase en la nube..."

# Verificar que estamos en el directorio correcto
if [ ! -d "backend-vevil" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio vevil-system"
    exit 1
fi

# Configurar Backend
echo ""
echo "📦 Configurando Backend..."
cd backend-vevil

if [ -f ".env" ]; then
    echo "⚠️  Ya existe un archivo .env en backend-vevil"
    read -p "¿Deseas sobreescribirlo? (s/n): " overwrite
    if [ "$overwrite" != "s" ] && [ "$overwrite" != "S" ]; then
        echo "⏭️  Manteniendo .env existente"
    else
        cp .env.development.example .env
        echo "✅ .env creado desde .env.development.example"
    fi
else
    cp .env.development.example .env
    echo "✅ .env creado desde .env.development.example"
fi

echo ""
echo "📝 Configura las credenciales de Supabase en backend-vevil/.env:"
echo "   1. Ve a https://supabase.com/dashboard"
echo "   2. Selecciona tu proyecto de desarrollo"
echo "   3. Ve a Settings → Database"
echo "   4. Copia las credenciales a .env:"
echo "      - DB_HOST"
echo "      - DB_USERNAME"
echo "      - DB_PASSWORD"
echo ""
echo "   También configura:"
echo "      - JWT_SECRET (genera uno nuevo)"
echo "      - JWT_REFRESH_SECRET (genera uno nuevo)"
echo ""

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
npm install

cd ..

# Configurar Frontend
echo ""
echo "📦 Configurando Frontend..."
cd frontend-vevil 2>/dev/null || cd ../frontend-vevil 2>/dev/null || {
    echo "⚠️  No se encontró el directorio frontend-vevil"
    echo "   Asegúrate de tener el frontend configurado"
    cd ..
}

if [ -f ".env" ]; then
    echo "⚠️  Ya existe un archivo .env en frontend-vevil"
    read -p "¿Deseas sobreescribirlo? (s/n): " overwrite
    if [ "$overwrite" != "s" ] && [ "$overwrite" != "S" ]; then
        echo "⏭️  Manteniendo .env existente"
    else
        # Crear .env para frontend
        echo "VITE_API_URL=http://localhost:3000/api" > .env
        echo "✅ .env creado para frontend"
    fi
else
    echo "VITE_API_URL=http://localhost:3000/api" > .env
    echo "✅ .env creado para frontend"
fi

# Instalar dependencias del frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
npm install

cd ..

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Para levantar el entorno de desarrollo:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd vevil-system/backend-vevil"
echo "   npm run start:dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd vevil-system/frontend-vevil"
echo "   npm run dev"
echo ""
echo "🌐 URLs locales:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📊 Base de datos: Supabase en la nube (desarrollo)"
