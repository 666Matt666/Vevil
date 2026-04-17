# Manual de Calidad de Código - Vevil

Este proyecto incluye **validación automática** en cada commit usando Husky + lint-staged.

## 📦 Qué incluye

### Frontend (React 19 + Vite + TypeScript)
- **Typecheck**: `npm run typecheck` → `tsc --noEmit`
- **Lint**: ESLint con reglas TypeScript + React
- **Format**: Prettier (autofix en archivos staged)
- **Hooks**: `lint-staged` solo evalúa archivos modificados (rápido)

### Backend (NestJS + TypeScript)
- **Typecheck**: `npm run typecheck`
- **Lint**: ESLint con reglas NestJS
- **Test**: Jest unit tests
- **Hooks**: se ejecutan completos en cada commit

## 🚀 Instalación (una sola vez)

Ejecutá en **cada proyecto**:

```bash
# Frontend
cd frontend-vevil
npm install          # Instala husky, lint-staged, eslint, prettier
npm run prepare      # Instala los hooks de git (o: npx husky install)

# Backend
cd backend-vevil
npm install          # Instala husky, lint-staged, eslint
npm run prepare      # Instala los hooks de git
```

### Verificación
```bash
git status           # Deberías ver "husky" en la salida si está instalado
npx husky info       # Muestra estado de hooks
```

## ✅ Flujo de trabajo con Husky

### Antes (sin Husky)
```bash
git add .
git commit -m "feat: algo"   # ❌ Podía romper cosas
```

### Ahora (con Husky)
```bash
git add .
git commit -m "feat: algo"
# ↓ Automáticamente:
# 1. 🔍 Typecheck (TypeScript)
# 2. 📝 Lint (ESLint) + autofix
# 3. 🧪 Tests (solo backend)
# 4. ✨ Format (Prettier) en archivos staged

# Si algo falla → commit CANCELADO, arreglá y volvé a commitear
```

### Saltar validación (emergencias)
```bash
git commit --no-verify -m "hotfix: urgente"
```
⚠️ Usar solo cuando sea absolutamente necesario.

## 📝 Comandos disponibles

### Frontend
```bash
npm run typecheck    # Check de tipos (sin compilar)
npm run lint         # Lint todos los archivos
npm run format       # Formatear todo con Prettier
npm test             # Tests unitarios (Vitest)
```

### Backend
```bash
npm run typecheck    # Check de tipos
npm run lint         # Lint todos los archivos .ts
npm test             # Tests unitarios (Jest)
```

## 🔧 Reglas aplicadas

### ESLint (ver `.eslintrc.js` en cada proyecto)
- **TypeScript**: no `any`, prefer `const`, no vars sin usar
- **React**: hooks exhaustivos, prop-types deshabilitado (usamos TS)
- **NestJS**: logger, inyección de dependencias, async/await
- **General**: no `console` (solo warn/error), no `eval`, equality estricta

### Prettier
- Sin punto y coma
- Comillas simples
- Máximo 100 columnas
- Auto-cierre de paréntesis en arrow functions

### Husky (pre-commit)
- Frontend: `typecheck` → `lint-staged` (eslint + prettier en staged files)
- Backend: `typecheck` → `lint` → `test`

## 🐛 Solución de problemas

### Husky no se ejecuta
```bash
npx husky install      # Reinstala hooks
git add .              # Re-stage para disparar pre-commit
```

### Error: "husky: command not found"
```bash
npm install            # Instala dependencias faltantes
```

### Quitar Husky completamente
```bash
npx husky uninstall
```

### Lint falla en archivos no staged
```bash
npm run lint -- --fix   # Autofix todos los archivos
```

## 📚 Recursos
- [Husky Docs](https://typicode.github.io/husky)
- [lint-staged](https://github.com/okonet/lint-staged)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)

---

**Importante**: Estos hooks se ejecutan **localmente** en tu máquina. En CI/CD (GitHub Actions, etc.) también deberías agregar los mismos comandos.
