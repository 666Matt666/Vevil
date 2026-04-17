# Vevil System

Backend (NestJS) + frontend (React/Vite). **En la PC** todo corre con Postgres local; **al hacer push** la nube usa Render + Vercel + Supabase.

## Estado del Proyecto

[![Backend Tests](https://img.shields.io/badge/backend-tests-138%2F138%20pass-brightgreen?logo=jest)](https://github.com/666Matt666/Vevil/actions)
[![Frontend Tests](https://img.shields.io/badge/frontend-tests-27%2F27%20pass-brightgreen?logo=vitest)](https://github.com/666Matt666/Vevil/actions)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?logo=github-actions)](https://github.com/666Matt666/Vevil/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ✅ **Última actualización:** 17 de abril de 2026  
> 📚 **Documentación completa:** [docs/README.md](./docs/README.md)

## Flujo de trabajo

**Siempre trabajamos en local.** La nube (Render, Vercel, Supabase) se usa solo cuando hacemos push a `main`. No hace falta configurar ni tocar la nube hasta que quieras desplegar.

## 🚀 Desarrollo en la PC (comandos principales)

```bash
# Clonar e instalar (primera vez)
git clone <repo-url>
cd vevil-system
npm install
cd backend-vevil && npm install && cd ..
cd frontend-vevil && npm install && cd ..

# Levantar todo (Postgres + backend + frontend)
npm run dev

# Verificar antes de commit
npm run test:backend   # Tests backend (138/138)
npm run test:frontend  # Tests frontend (27/27)
npm run lint:backend   # Lint backend
npm run lint:frontend  # Lint frontend
npm run typecheck      # Build check (backend + frontend)

# Tests E2E (opcional, requiere DB local)
npm run e2e:local
```

- Backend: **http://localhost:3000** → API: `/api`, Swagger: `/api/docs`
- Frontend: **http://localhost:5173**
- Base de datos: PostgreSQL local (Docker)

> **Primera vez o migraciones nuevas:** después de levantar Postgres, ejecutar `npm run db:migrate` (desde `vevil-system`).

## 📊 Entornos

| Entorno | Frontend | Backend | Base de datos |
|---------|----------|---------|---------------|
| **Desarrollo (local)** | http://localhost:5173 | http://localhost:3000 | PostgreSQL (Docker) |
| **QA** | https://vevil-qa.fly.dev | https://vevil-qa.fly.dev | Supabase QA |
| **Producción** | https://vevil.fly.dev | https://vevil-dtt7ta.fly.dev | Supabase (postgres.ozxwmdksnfzzoepspnfo) |

## Subir a PROD (nube)

```bash
git add .
git commit -m "feat: descripción de cambios"
git push origin main
```

- **Backend**: Render despliega automáticamente desde `vevil-system/backend-vevil`
- **Frontend**: Vercel despliega desde `vevil-system/frontend-vevil`
- Variables de entorno configuradas en cada plataforma (ver [docs/DEPLOY.md](./docs/DEPLOY.md))

## 📖 Documentación

| Guía | Descripción |
|------|-------------|
| **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** | Configuración local, variables de entorno, tests, debugging, convenciones de código |
| **[docs/DEPLOY.md](./docs/DEPLOY.md)** | Despliegue automatizado (Render, Vercel, Supabase), variables, CI/CD |
| **[docs/PRE_DEPLOY_LOCAL_CHECK.md](./docs/PRE_DEPLOY_LOCAL_CHECK.md)** | Checklist local antes de hacer push |
| **[docs/E2E.md](./docs/E2E.md)** | Cómo correr tests E2E con Playwright (flujos críticos) |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Arquitectura, patrones, modelo de datos, seguridad |
| **[AGENTS.md](./AGENTS.md)** | Best practices aplicadas (React, NestJS, PostgreSQL, Testing) |
| **[SKILLS.md](./SKILLS.md)** | Skills instaladas y cómo agragar nuevas |

## 🧪 Tests & Calidad

| | Backend | Frontend |
|---------|---------|----------|
| **Unit tests** | ✅ 138/138 pasan | ✅ 27/27 pasan |
| **Build** | ✅ NestJS compila | ✅ Vite compila |
| **Lint** | ✅ ESLint config | ✅ ESLint config + plugins |
| **Coverage** | ~70% (en crecimiento) | ~60% (en crecimiento) |

**Comandos de calidad:**
```bash
npm run test:backend      # Jest unit tests
npm run test:frontend     # Vitest unit tests
npm run e2e:local         # Playwright E2E (local)
npm run lint:backend      # ESLint backend
npm run lint:frontend     # ESLint frontend
npm run typecheck         # Build check (tsc + nest build)
```

## 🔧 Stack técnico

- **Backend**: NestJS + TypeORM + PostgreSQL (Supabase) + JWT + WebAuthn
- **Frontend**: React 19 + Vite + TypeScript + React Router + Axios
- **Estilos**: CSS custom (tema verde #22c55e)
- **Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)
- **CI/CD**: GitHub Actions → Render (backend) + Vercel (frontend)
- **Calidad de código**: ESLint + Prettier + Husky + lint-staged

## 🐛 Reportar problemas

Usá el [Issue Tracker](https://github.com/666Matt666/Vevil/issues) para:
- Bugs 🐛
- Features solicitadas ✨
- Mejoras de documentación 📚

---

**¡Feliz desarrollo!** 🚀
