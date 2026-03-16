#!/bin/bash

# Script para verificar el estado completo del despliegue
# Puede ejecutarse desde cualquier directorio

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuración - Edita estas URLs según tu despliegue
BACKEND_URL="${BACKEND_URL:-https://vevil-backend.onrender.com/api}"
BACKEND_BASE_URL="${BACKEND_BASE_URL:-https://vevil-backend.onrender.com}"

echo "🔍 Verificando estado del despliegue completo..."
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. Verificar Backend (Render.com)
echo -e "${BLUE}1️⃣ BACKEND (Render.com)${NC}"
echo "─────────────────────────────────"
echo -e "${CYAN}Verificando: $BACKEND_URL${NC}"

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" --max-time 30 2>/dev/null)

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ Backend accesible${NC}"
    echo "   URL: $BACKEND_URL"
    echo "   Status: $BACKEND_STATUS"
    
    # Verificar API Docs
    DOCS_URL="$BACKEND_BASE_URL/api/docs"
    echo -e "${CYAN}Verificando API Docs: $DOCS_URL${NC}"
    DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOCS_URL" --max-time 30 2>/dev/null)
    if [ "$DOCS_STATUS" = "200" ]; then
        echo -e "   ${GREEN}✅ API Docs accesible${NC}"
        echo "   Docs: $DOCS_URL"
    else
        echo -e "   ${YELLOW}⚠️  API Docs no accesible (Status: $DOCS_STATUS)${NC}"
        echo "   Nota: Puede tardar ~30 segundos si el servicio estaba dormido"
    fi
elif [ -z "$BACKEND_STATUS" ]; then
    echo -e "${YELLOW}⚠️  No se pudo conectar (timeout o sin respuesta)${NC}"
    echo "   URL: $BACKEND_URL"
    echo "   Nota: En Render.com gratuito, el servicio puede tardar ~30 segundos"
    echo "         en despertar después de 15 minutos de inactividad"
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
echo "   3. Verifica que esté activo (no pausado)"
echo ""
echo "   Para verificar desde Render:"
echo "   1. Ve a https://dashboard.render.com"
echo "   2. Selecciona tu servicio backend"
echo "   3. Ve a la pestaña 'Logs'"
echo "   4. Busca mensajes de conexión a la base de datos"
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
echo "💡 Para configurar una URL diferente del backend:"
echo "   export BACKEND_URL=https://tu-backend.onrender.com/api"
echo "   ./verificar-todo.sh"
echo ""
echo "📖 Para más detalles, revisa:"
echo "   - GUIA-DESPLIEGUE-NUBE.md"
echo "   - ESTADO-BASE-DATOS.md"











