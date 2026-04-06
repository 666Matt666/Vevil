#!/bin/bash

# Script para copiar variables de entorno de producción a desarrollo
# Uso: ./copy-secrets-to-dev.sh

set -e

echo "📋 Copiando variables de entorno de producción a desarrollo"

# Verificar si flyctl está instalado
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl no está instalado. Por favor, instálalo primero:"
    echo "   https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Verificar si el usuario está autenticado
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ No estás autenticado en Fly.io. Ejecuta: flyctl auth login"
    exit 1
fi

echo "✅ flyctl está instalado y autenticado"

# Obtener secrets de producción
echo "📥 Obteniendo variables de producción (vevil-dtt7ta)..."
PROD_SECRETS=$(flyctl secrets list -a vevil-dtt7ta --json)

if [ -z "$PROD_SECRETS" ] || [ "$PROD_SECRETS" = "[]" ]; then
    echo "⚠️  No se encontraron variables de entorno en producción"
    exit 0
fi

echo "📤 Copiando variables a desarrollo (vevil-dev)..."

# Copiar cada secret a desarrollo
echo "$PROD_SECRETS" | jq -r '.[] | "\(.Name)=\(.Value)"' | while IFS='=' read -r name value; do
    if [ -n "$name" ] && [ -n "$value" ]; then
        echo "   Configurando: $name"
        flyctl secrets set "$name=$value" -a vevil-dev
    fi
done

echo ""
echo "✅ ¡Variables de entorno copiadas exitosamente!"
echo ""
echo "📋 Variables configuradas en vevil-dev:"
flyctl secrets list -a vevil-dev
