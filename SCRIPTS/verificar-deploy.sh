#!/bin/bash

# Script para verificar el estado del despliegue de Vevil System

echo "🔍 Verificando estado del despliegue..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Backend (Render)
echo "1️⃣ Verificando Backend (Render)..."
BACKEND_URL="https://evil-backend.onrender.com/api"
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend accesible en: $BACKEND_URL${NC}"
    echo "   📚 API Docs: https://evil-backend.onrender.com/api/docs"
else
    echo -e "${RED}❌ Backend no responde en: $BACKEND_URL${NC}"
fi
echo ""

# 2. Verificar Frontend (Vercel)
echo "2️⃣ Verificando Frontend (Vercel)..."
echo -e "${YELLOW}⚠️  Necesitas verificar manualmente en Vercel:${NC}"
echo "   - Ve a https://vercel.com y verifica tu proyecto"
echo "   - Verifica que la variable VITE_API_URL esté configurada"
echo ""

# 3. Verificar Base de Datos
echo "3️⃣ Verificando Base de Datos (Supabase)..."
echo -e "${YELLOW}⚠️  Necesitas verificar manualmente:${NC}"
echo "   - Ve a https://supabase.com y verifica tu proyecto"
echo "   - Verifica que las variables de entorno en Render estén configuradas"
echo ""

# 4. Verificar Variables de Entorno necesarias
echo "4️⃣ Variables de Entorno necesarias:"
echo ""
echo "📦 En Render (Backend):"
echo "   - DB_HOST=...pooler.supabase.com (o db.xxx.supabase.co)"
echo "   - DB_PORT=5432"
echo "   - DB_USERNAME=postgres"
echo "   - DB_PASSWORD=tu_password_supabase"
echo "   - DB_DATABASE=postgres"
echo "   - JWT_SECRET=tu_clave_secreta"
echo ""
echo "📦 En Vercel (Frontend):"
echo "   - VITE_API_URL=https://evil-backend.onrender.com/api"
echo ""

echo "✅ Verificación completa!"
echo ""
echo "📖 Para más detalles, revisa: CHECKLIST-DEPLOY.md"











