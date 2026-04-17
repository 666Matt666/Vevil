#!/bin/bash
# Instala y configura Husky + lint-staged en ambos proyectos

echo "🔧 Configurando Husky en frontend-vevil..."
cd frontend-vevil
npm install --save-dev husky lint-staged
npx husky init
npx husky add .husky/pre-commit "npm run typecheck && npx lint-staged"
git add .husky/pre-commit
echo "✅ Frontend configurado"

echo ""
echo "🔧 Configurando Husky en backend-vevil..."
cd ../backend-vevil
npm install --save-dev husky lint-staged @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
npx husky init
npx husky add .husky/pre-commit "npm run typecheck && npm run lint && npm test"
git add .husky/pre-commit
echo "✅ Backend configurado"

echo ""
echo "📋 Resumen:"
echo "   Frontend pre-commit: typecheck + lint-staged (eslint + prettier en archivos staged)"
echo "   Backend pre-commit: typecheck + lint + test"
echo ""
echo "⚡ Ahora cada git commit ejecutará automáticamente:"
echo "   1. TypeScript typecheck (sin errores de tipos)"
echo "   2. Linter (estilo de código)"
echo "   3. Tests unitarios (solo backend, frontend usa lint-staged)"
echo ""
echo "🚀 Para deshabilitar temporalmente: git commit --no-verify"
