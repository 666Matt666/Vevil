#!/bin/bash
# Script para configurar la app de QA en Fly.io
# Ejecutar: bash setup-fly-qa.sh

set -e

echo "🚀 Configurando app de QA en Fly.io..."

# Verificar que flyctl esté instalado
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl no está instalado. Instálalo desde: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Verificar que estés logueado
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ No estás logueado en Fly.io. Ejecuta: flyctl auth login"
    exit 1
fi

# Crear app de QA
echo "📦 Creando app vevil-qa..."
flyctl apps create vevil-qa || echo "⚠️  La app vevil-qa ya existe, continuando..."

# Configurar secrets de QA
echo "🔐 Configurando secrets de QA..."
echo "Por favor, ingresa las credenciales de la base de datos de QA:"

read -p "DB_HOST: " DB_HOST
read -p "DB_USERNAME: " DB_USERNAME
read -s -p "DB_PASSWORD: " DB_PASSWORD
echo
read -p "JWT_SECRET: " JWT_SECRET
read -s -p "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET
echo

# Configurar secrets en Fly.io
flyctl secrets set \
    DB_HOST="$DB_HOST" \
    DB_PORT="5432" \
    DB_USERNAME="$DB_USERNAME" \
    DB_PASSWORD="$DB_PASSWORD" \
    DB_DATABASE="postgres" \
    JWT_SECRET="$JWT_SECRET" \
    JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
    CORS_ORIGINS="https://vevil-qa.vercel.app" \
    NODE_ENV="production" \
    -a vevil-qa

echo "✅ App de QA configurada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crear rama qa en Git: git checkout -b qa && git push origin qa"
echo "2. Configurar GitHub Secrets (ver lista abajo)"
echo "3. Configurar frontend en Vercel para la rama qa"
echo ""
echo "🔑 Secrets requeridos en GitHub:"
echo "   - FLY_API_TOKEN"
echo "   - DB_HOST_QA"
echo "   - DB_USERNAME_QA"
echo "   - DB_PASSWORD_QA"
echo "   - JWT_SECRET_QA"
echo "   - JWT_REFRESH_SECRET_QA"
