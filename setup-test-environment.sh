#!/bin/bash

# Script para configurar ambiente de desarrollo/TEST
# Uso: ./setup-test-environment.sh

set -e

echo "🚀 Configurando ambiente de DESARROLLO/TEST para Vevil System"
echo ""
echo "Este script te guiará para configurar:"
echo "  1. Rama develop en GitHub"
echo "  2. Base de datos en Supabase (DEV)"
echo "  3. Backend en Render (DEV)"
echo "  4. Frontend en Vercel (DEV)"
echo ""

# Verificar si estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ No estás en un repositorio git"
    exit 1
fi

echo "✅ Repositorio git detectado"

# Paso 1: Crear rama develop
echo ""
echo "📦 PASO 1: Crear rama develop"
echo "-----------------------------------"

if git show-ref --verify --quiet refs/heads/develop; then
    echo "ℹ️  La rama develop ya existe"
else
    echo "Creando rama develop..."
    git checkout -b develop
    git push -u origin develop
    echo "✅ Rama develop creada y subida a GitHub"
fi

# Paso 2: Configurar Supabase
echo ""
echo "🗄️  PASO 2: Configurar base de datos en Supabase"
echo "------------------------------------------------"
echo ""
echo "Por favor, sigue estos pasos manualmente:"
echo ""
echo "1. Ve a https://supabase.com/dashboard"
echo "2. Click en 'New Project'"
echo "3. Nombre: vevil-dev"
echo "4. Configura la base de datos"
echo "5. Ve a Settings → Database"
echo "6. Copia las credenciales:"
echo "   - Host"
echo "   - Username"
echo "   - Password"
echo ""
read -p "Presiona Enter cuando hayas creado la base de datos..."

# Paso 3: Configurar Render
echo ""
echo "🖥️  PASO 3: Configurar backend en Render"
echo "----------------------------------------"
echo ""
echo "Por favor, sigue estos pasos manualmente:"
echo ""
echo "1. Ve a https://dashboard.render.com"
echo "2. Click en 'New +' → 'Web Service'"
echo "3. Conecta tu repositorio de GitHub"
echo "4. Nombre: vevil-backend-dev"
echo "5. Branch: develop"
echo "6. Runtime: Node"
echo "7. Build Command: npm install && npm run build"
echo "8. Start Command: npm run start:prod"
echo "9. En Settings → Environment Variables, agrega:"
echo "   DB_HOST=tu-host-supabase-dev"
echo "   DB_PORT=5432"
echo "   DB_USERNAME=tu-username-dev"
echo "   DB_PASSWORD=tu-password-dev"
echo "   DB_DATABASE=postgres"
echo "   JWT_SECRET=VevilJwtS3cr3tD3v_$(openssl rand -hex 16)"
echo "   JWT_REFRESH_SECRET=VevilR3fr3shS3cr3tD3v_$(openssl rand -hex 16)"
echo "   CORS_ORIGINS=https://vevil-dev.vercel.app"
echo ""
read -p "Presiona Enter cuando hayas creado el servicio en Render..."

# Paso 4: Configurar Vercel
echo ""
echo "🎨 PASO 4: Configurar frontend en Vercel"
echo "----------------------------------------"
echo ""
echo "Por favor, sigue estos pasos manualmente:"
echo ""
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Click en 'Add New...' → 'Project'"
echo "3. Importa tu repositorio de GitHub"
echo "4. Nombre: vevil-dev"
echo "5. Branch: develop"
echo "6. En Settings → Environment Variables, agrega:"
echo "   VITE_API_URL=https://vevil-backend-dev.onrender.com/api"
echo "7. En Settings → Domains, agrega:"
echo "   vevil-dev.vercel.app"
echo ""
read -p "Presiona Enter cuando hayas creado el proyecto en Vercel..."

# Paso 5: Ejecutar migraciones
echo ""
echo "🔄 PASO 5: Ejecutar migraciones"
echo "-------------------------------"
echo ""
echo "Una vez que el backend esté desplegado en Render,"
echo "las migraciones se ejecutarán automáticamente."
echo ""
echo "Si necesitas ejecutarlas manualmente:"
echo "  cd vevil-system/backend-vevil"
echo "  npm run migration:run:prod"
echo ""

# Resumen
echo ""
echo "✅ ¡Ambiente de desarrollo configurado!"
echo ""
echo "📋 Resumen:"
echo "   - GitHub: Rama 'develop'"
echo "   - Supabase: Proyecto 'vevil-dev'"
echo "   - Render: Servicio 'vevil-backend-dev'"
echo "   - Vercel: Proyecto 'vevil-dev'"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: https://vevil-dev.vercel.app"
echo "   - Backend: https://vevil-backend-dev.onrender.com"
echo "   - API: https://vevil-backend-dev.onrender.com/api"
echo ""
echo "📚 Flujo de trabajo:"
echo "   1. Trabaja en la rama 'develop'"
echo "   2. Haz push a GitHub"
echo "   3. Los cambios se despliegan automáticamente"
echo "   4. Cuando esté listo, merge a 'main' para producción"
echo ""
echo "📖 Para más información, consulta: vevil-system/DEPLOYMENT-MULTI-ENV.md"
