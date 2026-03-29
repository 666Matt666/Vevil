#!/bin/bash
# Script para configurar GitHub Secrets usando GitHub CLI
# Ejecutar: bash setup-github-secrets.sh

set -e

echo "🔐 Configurando GitHub Secrets..."

# Verificar que gh esté instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado."
    echo "Instálalo desde: https://cli.github.com/"
    exit 1
fi

# Verificar que estés logueado
if ! gh auth status &> /dev/null; then
    echo "❌ No estás logueado en GitHub. Ejecuta: gh auth login"
    exit 1
fi

# Obtener el repositorio actual
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repositorio: $REPO"

echo ""
echo "Ingresa los valores de los secrets (se ocultarán al escribir):"
echo ""

# Fly.io Token
read -s -p "FLY_API_TOKEN: " FLY_API_TOKEN
echo

# Producción
echo ""
echo "📊 Producción:"
read -s -p "DB_HOST: " DB_HOST
echo
read -s -p "DB_USERNAME: " DB_USERNAME
echo
read -s -p "DB_PASSWORD: " DB_PASSWORD
echo
read -s -p "JWT_SECRET: " JWT_SECRET
echo
read -s -p "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET
echo

# Desarrollo
echo ""
echo "🛠️  Desarrollo:"
read -s -p "DB_HOST_DEV: " DB_HOST_DEV
echo
read -s -p "DB_USERNAME_DEV: " DB_USERNAME_DEV
echo
read -s -p "DB_PASSWORD_DEV: " DB_PASSWORD_DEV
echo
read -s -p "JWT_SECRET_DEV: " JWT_SECRET_DEV
echo
read -s -p "JWT_REFRESH_SECRET_DEV: " JWT_REFRESH_SECRET_DEV
echo

# QA
echo ""
echo "🧪 QA:"
read -s -p "DB_HOST_QA: " DB_HOST_QA
echo
read -s -p "DB_USERNAME_QA: " DB_USERNAME_QA
echo
read -s -p "DB_PASSWORD_QA: " DB_PASSWORD_QA
echo
read -s -p "JWT_SECRET_QA: " JWT_SECRET_QA
echo
read -s -p "JWT_REFRESH_SECRET_QA: " JWT_REFRESH_SECRET_QA
echo

echo ""
echo "📤 Configurando secrets en GitHub..."

# Configurar secrets
gh secret set FLY_API_TOKEN -b "$FLY_API_TOKEN" -R "$REPO"
gh secret set DB_HOST -b "$DB_HOST" -R "$REPO"
gh secret set DB_USERNAME -b "$DB_USERNAME" -R "$REPO"
gh secret set DB_PASSWORD -b "$DB_PASSWORD" -R "$REPO"
gh secret set JWT_SECRET -b "$JWT_SECRET" -R "$REPO"
gh secret set JWT_REFRESH_SECRET -b "$JWT_REFRESH_SECRET" -R "$REPO"

gh secret set DB_HOST_DEV -b "$DB_HOST_DEV" -R "$REPO"
gh secret set DB_USERNAME_DEV -b "$DB_USERNAME_DEV" -R "$REPO"
gh secret set DB_PASSWORD_DEV -b "$DB_PASSWORD_DEV" -R "$REPO"
gh secret set JWT_SECRET_DEV -b "$JWT_SECRET_DEV" -R "$REPO"
gh secret set JWT_REFRESH_SECRET_DEV -b "$JWT_REFRESH_SECRET_DEV" -R "$REPO"

gh secret set DB_HOST_QA -b "$DB_HOST_QA" -R "$REPO"
gh secret set DB_USERNAME_QA -b "$DB_USERNAME_QA" -R "$REPO"
gh secret set DB_PASSWORD_QA -b "$DB_PASSWORD_QA" -R "$REPO"
gh secret set JWT_SECRET_QA -b "$JWT_SECRET_QA" -R "$REPO"
gh secret set JWT_REFRESH_SECRET_QA -b "$JWT_REFRESH_SECRET_QA" -R "$REPO"

echo ""
echo "✅ GitHub Secrets configurados exitosamente!"
echo ""
echo "📋 Secrets configurados:"
echo "   - FLY_API_TOKEN"
echo "   - DB_HOST, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET (Producción)"
echo "   - DB_HOST_DEV, DB_USERNAME_DEV, DB_PASSWORD_DEV, JWT_SECRET_DEV, JWT_REFRESH_SECRET_DEV (Desarrollo)"
echo "   - DB_HOST_QA, DB_USERNAME_QA, DB_PASSWORD_QA, JWT_SECRET_QA, JWT_REFRESH_SECRET_QA (QA)"
echo ""
echo "🔗 Verifica en: https://github.com/$REPO/settings/secrets/actions"
