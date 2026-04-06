# Guía de Despliegue Multi-Ambiente - Vevil System

## Arquitectura Actual

### Producción (PROD)
- **GitHub**: Rama `main`
- **Fly.io**: `vevil-dtt7ta` (backend)
- **Vercel**: `vevil.vercel.app` (frontend)
- **Supabase**: Base de datos PostgreSQL de producción

### Desarrollo (DEV)
- **GitHub**: Rama `develop`
- **Fly.io**: `vevil-dev` (backend)
- **Vercel**: `vevil-dev.vercel.app` (frontend)
- **Supabase**: Proyecto separado para desarrollo

### QA (Quality Assurance)
- **GitHub**: Rama `qa`
- **Fly.io**: `vevil-qa` (backend)
- **Vercel**: `vevil-qa.vercel.app` (frontend)
- **Supabase**: Proyecto separado para QA (copia de develop)

## Flujo de Trabajo

```
develop ──► QA ──► main
  │         │       │
  │         │       └──► Producción (no tocar)
  │         └──────────► Testing/QA
  └────────────────────► Desarrollo activo
```

### Desarrollo
```bash
# 1. Trabajar en la rama develop
git checkout develop
git add .
git commit -m "mi cambio"
git push origin develop

# 2. Auto-deploy a Fly.io (vevil-dev)
# GitHub Actions ejecuta tests y despliega automáticamente
```

### QA
```bash
# 1. Cuando develop está listo para QA
git checkout qa
git merge develop
git push origin qa

# 2. Auto-deploy a Fly.io (vevil-qa)
# GitHub Actions ejecuta tests y despliega automáticamente
```

### Producción
```bash
# 1. Cuando QA aprueba
git checkout main
git merge qa
git push origin main

# 2. Auto-deploy a Fly.io (vevil-dtt7ta)
# GitHub Actions ejecuta tests y despliega automáticamente
```

## Configuración de Ambientes

### 1. Supabase - Bases de Datos

#### Producción
- Proyecto: `vevil-prod`
- Credenciales en GitHub Secrets: `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`

#### Desarrollo
- Proyecto: `vevil-dev`
- Credenciales en GitHub Secrets: `DB_HOST_DEV`, `DB_USERNAME_DEV`, `DB_PASSWORD_DEV`

#### QA
- Proyecto: `vevil-qa`
- Credenciales en GitHub Secrets: `DB_HOST_QA`, `DB_USERNAME_QA`, `DB_PASSWORD_QA`

### 2. Fly.io - Configuración

| Ambiente | Archivo | App ID | Rama |
|----------|---------|--------|------|
| Producción | `fly.toml` | `vevil-dtt7ta` | `main` |
| Desarrollo | `fly.dev.toml` | `vevil-dev` | `develop` |
| QA | `fly.qa.toml` | `vevil-qa` | `qa` |

### 3. Variables de Entorno

Los archivos `.env.{environment}.example` contienen los templates con placeholders.
Las credenciales reales se configuran en **GitHub Secrets** y se inyectan durante el deploy.

#### Archivos de template:
- `backend-vevil/.env.production.example` - Producción
- `backend-vevil/.env.development.example` - Desarrollo
- `backend-vevil/.env.qa.example` - QA

#### Secrets requeridos en GitHub:

**Producción:**
```
DB_HOST
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_REFRESH_SECRET
FLY_API_TOKEN
```

**Desarrollo:**
```
DB_HOST_DEV
DB_USERNAME_DEV
DB_PASSWORD_DEV
JWT_SECRET_DEV
JWT_REFRESH_SECRET_DEV
FLY_API_TOKEN
```

**QA:**
```
DB_HOST_QA
DB_USERNAME_QA
DB_PASSWORD_QA
JWT_SECRET_QA
JWT_REFRESH_SECRET_QA
FLY_API_TOKEN
```

## URLs de los Ambientes

### Producción
- Frontend: https://vevil.vercel.app
- Backend: https://vevil-dtt7ta.fly.dev
- API: https://vevil-dtt7ta.fly.dev/api

### Desarrollo
- Frontend: https://vevil-dev.vercel.app
- Backend: https://vevil-dev.fly.dev
- API: https://vevil-dev.fly.dev/api

### QA
- Frontend: https://vevil-qa.vercel.app
- Backend: https://vevil-qa.fly.dev
- API: https://vevil-qa.fly.dev/api

## GitHub Actions Workflows

### CI (Continuous Integration)
- **Archivo:** `.github/workflows/ci.yml`
- **Triggers:** Push y PR a `main`, `develop`, `qa`
- **Acciones:** Ejecuta tests de backend y frontend

### Deploy (Continuous Deployment)
- **Archivo:** `.github/workflows/deploy.yml`
- **Triggers:** Push a `main`, `develop`, `qa`
- **Acciones:**
  - `main` → Deploy a `vevil-dtt7ta`
  - `develop` → Deploy a `vevil-dev`
  - `qa` → Deploy a `vevil-qa`

## Scripts de Configuración

### Verificar estado de los servicios
```bash
# Producción
curl https://vevil-dtt7ta.fly.dev/api/health

# Desarrollo
curl https://vevil-dev.fly.dev/api/health

# QA
curl https://vevil-qa.fly.dev/api/health
```

### Ejecutar migraciones manualmente
```bash
# Producción
flyctl ssh console -a vevil-dtt7ta -C "npm run migration:run:prod"

# Desarrollo
flyctl ssh console -a vevil-dev -C "npm run migration:run:prod"

# QA
flyctl ssh console -a vevil-qa -C "npm run migration:run:prod"
```

### Verificar logs
```bash
# Producción
flyctl logs -a vevil-dtt7ta

# Desarrollo
flyctl logs -a vevil-dev

# QA
flyctl logs -a vevil-qa
```

## Solución de Problemas

### El backend no conecta a la base de datos
1. Verificar variables de entorno en GitHub Secrets
2. Verificar que la base de datos de Supabase esté activa
3. Verificar credenciales correctas
4. Revisar logs: `flyctl logs -a {app-id}`

### El frontend no conecta al backend
1. Verificar `VITE_API_URL` en Vercel
2. Verificar `CORS_ORIGINS` en Fly.io
3. Verificar que el backend esté corriendo

### Los cambios no se despliegan automáticamente
1. Verificar que la rama correcta esté configurada en cada servicio
2. Verificar que GitHub Actions esté habilitado
3. Revisar logs de GitHub Actions en la pestaña "Actions"

### Tests fallan en CI
1. Ejecutar tests localmente: `npm test`
2. Revisar logs de GitHub Actions
3. Verificar que las dependencias estén actualizadas

## Comandos Útiles

### Fly.io
```bash
# Ver apps
flyctl apps list

# Ver estado de una app
flyctl status -a vevil-dev

# Ver logs en tiempo real
flyctl logs -a vevil-dev -f

# SSH a la máquina
flyctl ssh console -a vevil-dev

# Deploy manual (solo si es necesario)
flyctl deploy -a vevil-dev
```

### Git
```bash
# Ver ramas
git branch -a

# Cambiar de rama
git checkout develop

# Ver estado
git status

# Ver logs
git log --oneline -10
```
