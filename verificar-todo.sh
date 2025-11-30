#!/bin/bash

# Script para verificar el estado completo del despliegue

echo "🔍 Verificando estado del despliegue completo..."
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Backend (Fly.io)
echo -e "${BLUE}1️⃣ BACKEND (Fly.io)${NC}"
echo "─────────────────────────────────"
BACKEND_URL="https://vevil-dtt7ta.fly.dev/api"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" --max-time 10)

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ Backend accesible${NC}"
    echo "   URL: $BACKEND_URL"
    echo "   Status: $BACKEND_STATUS"
    
    # Verificar API Docs
    DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://vevil-dtt7ta.fly.dev/api/docs" --max-time 10)
    if [ "$DOCS_STATUS" = "200" ]; then
        echo -e "   ${GREEN}✅ API Docs accesible${NC}"
        echo "   Docs: https://vevil-dtt7ta.fly.dev/api/docs"
    else
        echo -e "   ${YELLOW}⚠️  API Docs no accesible (Status: $DOCS_STATUS)${NC}"
    fi
else
    echo -e "${RED}❌ Backend no responde${NC}"
    echo "   URL: $BACKEND_URL"
    echo "   Status: $BACKEND_STATUS"
    echo "   Error: No se pudo conectar al backend"
fi
echo ""

# 2. Verificar Frontend (Vercel)
echo -e "${BLUE}2️⃣ FRONTEND (Vercel)${NC}"
echo "─────────────────────────────────"
echo -e "${YELLOW}⚠️  Verificación manual requerida${NC}"
echo "   Para verificar el frontend:"
echo "   1. Ve a https://vercel.com"
echo "   2. Busca tu proyecto"
echo "   3. Copia la URL de producción"
echo "   4. Verifica que esté accesible"
echo ""
echo "   Si tienes la URL, ejecuta:"
echo "   curl https://TU-URL-VERCEL.vercel.app"
echo ""

# 3. Verificar Base de Datos (Supabase)
echo -e "${BLUE}3️⃣ BASE DE DATOS (Supabase)${NC}"
echo "─────────────────────────────────"
echo -e "${YELLOW}⚠️  Verificación manual requerida${NC}"
echo "   Para verificar la base de datos:"
echo "   1. Ve a https://supabase.com"
echo "   2. Selecciona tu proyecto"
echo "   3. Verifica que esté activo"
echo ""
echo "   Para verificar desde el backend:"
echo "   flyctl logs -a vevil-dtt7ta | grep -i 'error\|connection'"
echo ""

# Resumen
echo "=========================================="
echo -e "${BLUE}📊 RESUMEN${NC}"
echo "=========================================="

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ Backend: Funcionando${NC}"
else
    echo -e "${RED}❌ Backend: No responde${NC}"
fi

echo -e "${YELLOW}⚠️  Frontend: Verificar manualmente${NC}"
echo -e "${YELLOW}⚠️  Base de Datos: Verificar manualmente${NC}"
echo ""
echo "📖 Para más detalles, revisa: VERIFICAR-ESTADO.md"

