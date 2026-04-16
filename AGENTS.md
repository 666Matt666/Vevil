# Vevil - Agentes Best Practices

## Project Overview
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: NestJS + TypeORM + PostgreSQL (Supabase)
- **Styling**: Custom CSS with green theme (#22c55e, #14532d)
- **Auth**: JWT + WebAuthn
- **Deployment**: Vercel (frontend), Fly.io (backend)

## Environments

### Development (local)
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: PostgreSQL local (docker)

### QA (Fly.io)
- Frontend: https://vevil-qa.fly.dev
- Backend: https://vevil-qa.fly.dev
- Database: Supabase QA

### Production (Supabase)
- Frontend: https://vevil.fly.dev
- Backend: https://vevil-dtt7ta.fly.dev
- Database: Supabase (aws-1-us-east-2.pooler.supabase.com)
- DB: postgres.ozxwmdksnfzzoepspnfo

## Environment Variables

### Backend
```
# Local (.env)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=vevil_db

# Production (.env.production)
NODE_ENV=production
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.ozxwmdksnfzzoepspnfo
DB_PASSWORD=<secret>
DB_DATABASE=postgres
```

### Frontend
- API en desarrollo: http://localhost:3000/api
- API en producción: https://vevil-dtt7ta.fly.dev/api

## Production URLs

| Service | URL |
|---------|-----|
| Frontend (dev) | https://vevil-dev.fly.dev |
| Frontend (qa) | https://vevil-qa.fly.dev |
| Frontend (prod) | https://vevil.fly.dev |
| Backend (dev) | https://vevil-dev.fly.dev |
| Backend (qa) | https://vevil-qa.fly.dev |
| Backend (prod) | https://vevil-dtt7ta.fly.dev |

## Code Standards

### React / Frontend (Vercel React Best Practices)
- **Waterfalls**: Usar `Promise.all()` para operaciones independientes (CRÍTICO)
- **Bundle**: Importaciones directas, evitar barrel files; lazy loading con `React.lazy()` para componentes pesados
- **Rendering**: Usar `startTransition` para updates no urgentes; ternary en lugar de `&&` para condicionales
- **Re-renders**: Extraer trabajo costoso en `useMemo`; callbacks estables con `useCallback` cuando sea necesario
- **State**: Agrupar estados relacionados; usar función setter para actualizaciones basadas en estado previo
- **Effects**: Solo para sincronización con sistemas externos; limpiar event listeners/intervals
- **Imports**: Separar imports de tipos con `import type`; orden alfabético dentro de cada grupo

### NestJS / Backend (NestJS Best Practices)
- **Architecture**: Módulos por feature (no capas); responsabilidad única en servicios; evitar dependencias circulares
- **DI**: Usar `@Injectable()` con inyección por constructor; nunca instanciar con `new`
- **Validation**: DTOs con `class-validator`; `ValidationPipe` global; validar TODO input
- **Security**: Helmet.js, CORS whitelist, rate limiting en /auth, JWT seguro
- **Database**: Transacciones para multi-tabla; evitar N+1 con eager loading o joins; queries parametrizadas
- **Error Handling**: Exception filters globales; HTTP exceptions tipadas (NotFoundException, etc.)
- **API Design**: Recursos como sustantivos; versionado en URL (/api/v1/); documentación Swagger
- **Logging**: NestJS Logger estructurado; incluir contexto (userId, requestId)

### PostgreSQL / Supabase (Supabase Best Practices)
- **Indexes**: En columnas de WHERE, JOIN, ORDER BY; composite indexes para queries frecuentes
- **Queries**: Evitar `SELECT *`; paginación con cursor o LIMIT/OFFSET; EXPLAIN ANALYZE para queries lentas
- **Schema**: PKs claras; FKs con índices; tipos correctos (timestamptz); nombres en snake_case minúsculas
- **RLS**: Definir políticas explícitas; privilegios mínimos; nunca confiar en frontend
- **Connection**: Pooling configurado; prepared statements; idle timeout apropiado
- **Backup**: `pg_dump` con connection string completa; verificar restauración periódicamente

### TypeScript (TypeScript Best Practices)
- **Type Safety**: Preferir `unknown` sobre `any`; interfaces para objetos, types para uniones; aserciones mínimas
- **Immutability**: `readonly` para propiedades; spread Operator para copias; nunca mutar parámetros
- **Functions**: Return types explícitos en APIs públicas; parámetros con defaults claros; early returns
- **Error Handling**: Implementar `Result<T, E>` para errores recuperables; catch clauses con `unknown`; re-throw con contexto
- **Naming**: camelCase para variables/funciones; PascalCase para clases/interfaces; UPPERCASE para constants

## Performance Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms
- **Bundle size**: < 200KB gzipped para initial load

## Features Implementadas

### Sistema de Backup
- Rotación: 3 diarios, 4 semanales, 3 mensuales
- pg_dump para backups completos
- Copias incrementales diarias
- Alertas para descargar backups mensuales acumulados
- Ver contenido del backup desde UI
- **Enable/Disable toggle** via API (`/backups/enabled`)

### Auditoría
- Registro automático de acciones (create, update, delete, login, logout)
- Información: userId, userEmail, action, entityType, entityId, oldValue, newValue, ip, timestamp
- Filtros por entidad, acción, usuario, fecha
- Export a CSV

### Facturación
- Estados: pending, paid, cancelled
- Items con IVA (5%, 10%, Exento)
- Numeración automática según configuración (establecimiento-puntoExpedicion-rango)
- Timbrado con vigencia
- Recordatorios automáticos por email

### Reportes
- Overview, Stock, Accounts, By Product, By Customer, Profits, Charts
- Filtros por fecha (today, week, month, year, custom)
- Export CSV y PDF con logo de empresa
- Impresión directa

### Cuentas Corrientes
- Vista de deuda por cliente
- Registro de pagos (acreditar)
- Creación de facturas desde cuenta corriente (debitar)
- Historial de pagos con eliminación
- Botones de acción rápidos (Ver Clientes, Nueva Factura, Agregar Cliente, Editar, Acreditar Pago, Crear Factura)

### UI/UX
- Toast notifications para feedback
- ConfirmDialog para acciones destructivas
- EmptyState para listas vacías
- AlertsWidget compacto arriba del contenido (no flotante)
- Alertas de stock bajo, facturas pendientes, timbrado por vencer
- Logo con efectos visuales (shadow, border-radius)
- Tema verde consistente

## Common Pitfalls

### Frontend (React/Vite)
- ❌ No manejar errores en async functions
- ❌ Olvidar loading states
- ❌ Usar `any` como tipo
- ❌ No limpiar recursos en useEffect
- ❌ Waterfalls secuenciales en data fetching
- ❌ Barrel imports (incrementan bundle size 200-800ms)
- ❌ Condicionales con `&&` que renderizan 0 (usar ternary)
- ❌ Estado derivado en useEffect (calcular en render)
- ❌ Memoizar innecesariamente (React Compiler lo maneja)
- ❌ Definir componentes dentro de componentes

### Backend (NestJS)
- ❌ No validar input con DTOs
- ❌ Queries N+1 sin eager loading
- ❌ Exponer datos sensibles en responses
- ❌ No usar transacciones en operaciones multi-tabla
- ❌ Entidades sin created_at/updated_at para backup incremental
- ❌ Dependencias circulares entre módulos
- ❌ Servicios "god" con múltiples responsabilidades
- ❌ Hardcodear secrets en config
- ❌ No manejar errores async ( faltan catch)
- ❌ Usar `any` en servicios

### Database (PostgreSQL)
- ❌ Sin índices en columnas de filtro
- ❌ `SELECT *` innecesario
- ❌ No paginar resultados grandes
- ❌ Full table scans (usar EXPLAIN ANALYZE)
- ❌ FKs sin índice
- ❌ Transacciones largas (lock contention)
- ❌ No usar connection pooling

## Testing Checklist
- [ ] Build compila sin errores
- [ ] Login/logout funcionan
- [ ] CRUD productos completo
- [ ] CRUD clientes completo
- [ ] Crear factura con items
- [ ] Reportes exportan correctamente
- [ ] Backup se ejecuta y muestra en UI
- [ ] Auditoría registra acciones
- [ ] Cuentas corrientes: pagos y facturas funcionan
- [ ] Alertas se muestran correctamente

## Optional Improvements

### Security (HIGH PRIORITY)
- [ ] Agregar Helmet.js para security headers (HSTS, CSP)
- [ ] Implementar rate limiting en /auth (10 intentos/5min)
- [ ] CORS whitelist (orígenes específicos, no `*`)
- [ ] Validación en depth en DTOs (no solo required)
- [ ] Encriptar datos sensibles en DB (ruc, emails)
- [ ] Auditoría de dependencias (npm audit, Snyk)

### Testing (MEDIUM-HIGH PRIORITY)
- [ ] Agregar Playwright para E2E tests (flujos críticos: login, facturación, cobros)
- [ ] Tests unitarios para servicios backend (objetivo: 70% coverage)
- [ ] Tests de integración para APIs (login, invoices, accounts)
- [ ] Tests de accesibilidad (a11y) para componentes UI
- [ ] Playwright tests paralelizados con fixtures
- [ ] Mock de APIs externas (timbrado, email)
- [ ] Test coverage minimum: 80% unit, 60% integration

### Monitoring (MEDIUM PRIORITY)
- [ ] Logs estructurados (Pino o Winston con JSON)
- [ ] Métricas de negocio (facturas creadas, pagos procesados)
- [ ] Error tracking (Sentry)
- [ ] APM (Application Performance Monitoring)
- [ ] Health checks en /health (DB, Redis, etc.)
- [ ] Alertas para backup failures

### Performance (HIGH PRIORITY)
- [ ] Lazy loading de componentes pesados (Reportes, Charts)
- [ ] Virtualización para listas largas (>100 items)
- [ ] Optimizar imágenes (WebP, lazy loading, `fetchpriority`)
- [ ] Code splitting por rutas (React.lazy + Suspense)
- [ ] Caching en backend (Redis para métricas, config)
- [ ] CDN para assets estáticos (Vercel)
- [ ] Compresión gzip/brotli en respuestas
- [ ] Optimizar Largest Contentful Paint (LCP) - preload critical resources
- [ ] Mejorar INP - debounce inputs, Web Workers para cálculos pesados

### Documentation (MEDIUM PRIORITY)
- [ ] README actualizado con URLs de producción
- [ ] API docs en Swagger: /api/docs (con ejemplos)
- [ ] Guía de contribución (CONTRIBUTING.md)
- [ ] Arquitectura diagramada (C4 model o similar)
- [ ] Changelog automático (standard-version)
- [ ] Documentación de deployment (flyctl, vercel)

### Code Quality (MEDIUM PRIORITY)
- [ ] ESLint + Prettier configurados (frontend + backend)
- [ ] Husky pre-commit hooks (lint, test, typecheck)
- [ ] lint-staged para validar solo archivos staged
- [ ] Commit lint (conventional commits)
- [ ] DependenciasActualizadas (dependabot)
- [ ] Remover código muerto (unused imports, dead code)
- [ ] TypeScript strict mode (`strict: true` en tsconfig)

## Applied Skills & Rules
Este proyecto sigue las mejores prácticas de:

- **Vercel React Best Practices** (69 rules) - async waterfalls, bundle size, re-renders
- **NestJS Best Practices** (40 rules) - architecture, DI, validation, security
- **TypeScript Best Practices** - type safety, immutability, error handling
- **Supabase PostgreSQL Best Practices** - indexes, queries, RLS, connection pooling
- **Web Performance Optimization** - Core Web Vitals, lazy loading, code splitting
- **Testing Strategies** - test pyramid (70% unit, 20% integration, 10% E2E)

## Resources
- [PostgreSQL Best Practices](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices)
- [Playwright Testing](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices)
- [Vercel React Best Practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)
- [NestJS Best Practices](https://skills.sh/kadajett/agent-nestjs-skills/nestjs-best-practices)
- [TypeScript Best Practices](https://skills.sh/jwynia/agent-skills/typescript-best-practices)
- [Web Performance Optimization](https://skills.sh/bobmatnyc/claude-mpm-skills/web-performance-optimization)