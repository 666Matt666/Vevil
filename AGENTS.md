# Vevil - Agentes Best Practices

## Project Overview
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Styling**: Custom CSS with green theme (#22c55e, #14532d)
- **Auth**: JWT + WebAuthn

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

### React / Frontend
- Usar componentes funcionales con hooks
- Tipado estricto con TypeScript - nunca usar `any`
- Estados compuestos para objetos relacionados (no múltiples useState sueltos)
- Try/catch en funciones async con mensajes de error claros
- Loading states para todas las operaciones async
- Usar constantes para valores mágica (no hardcoded strings/numbers)

### NestJS / Backend
- Servicios con responsabilidades únicas
- DTOs con class-validator para validación
- Swagger/OpenAPI para documentación de APIs
- Logging con NestJS Logger
- Transactions para operaciones multi-tabla
- Respuestas estandarizadas { data, total }

### PostgreSQL (Supabase)
- Índices en columnas usadas en WHERE y JOIN
- Nombres descriptivos en snake_case (products, invoice_items)
- Timestamps con timezone para Paraguay (America/Asuncion)
- Validar entrada de datos en backend, nunca confiar en frontend
- Queries parametrizadas (no concatenar strings)
- SSL requerido para Supabase (`rejectUnauthorized: false`)
- No usar `synchronize: true` en producción (usa migrations)
- Backup en Supabase: usar `pg_dump` con connection string de Supabase o API de Supabase
- Supabase tiene backups automáticos - considerar usar `supabase db dump` o pg_restore
- Para backups desde el servidor, usar connection string completo de Supabase: `postgres://postgres.:[password]@aws-1-us-east-2.pooler.supabase.com:5432/postgres`

## Features Implementadas

### Sistema de Backup
- Rotación: 3 diarios, 4 semanales, 3 mensuales
- pg_dump para backups completos
- Copias incrementales diarias
- Alertas para descargar backups mensuales acumulados
- Ver contenido del backup desde UI

### Auditoría
- Registro automático de acciones (create, update, delete, login, logout)
- Información: userId, userEmail, action, entityType, entityId, oldValue, newValue, ip, timestamp
- Filtros por entidad, acción, usuario, fecha
- Export a CSV

### Facturación
- Estados: pending, paid, cancelled
--items con IVA (5%, 10%, Exento)
- Numeración automática según configuración (establecimiento-puntoExpedicion-rango)
- Timbrado con vigencia

### Reportes
- Overview, Stock, Accounts, By Product, By Customer, Profits, Charts
- Filtros por fecha (today, week, month, year, custom)
- Export CSV y PDF con logo de empresa
- Impresión directa

### UI/UX
- Toast notifications para feedback
- ConfirmDialog para acciones destructivas
- EmptyState para listas vacías
- AlertsWidget (stock bajo, timbrado por vencer)
- Logo con efectos visuales (shadow, border-radius)
- Tema verde consistente

## Common Pitfalls

### Frontend
- ❌ No manejar errores en async functions
- ❌ Olvidar loading states
- ❌ Usar `any` como tipo
- ❌ No limpiar recursos en useEffect

### Backend
- ❌ No validar input con DTOs
- ❌ Queries N+1 sin eager loading
- ❌ Exponer datos sensibles en responses
- ❌ No usar transacciones en operaciones multi-tabla
- ❌ Entidades sin created_at/updated_at para backup incremental

### Database
- ❌ Sin índices en columnas de filtro
- ❌SELECT * innecesario
- ❌ No paginar resultados grandes

## Testing Checklist
- [ ] Build compila sin errores
- [ ] Login/logout funcionan
- [ ] CRUD productos completo
- [ ] CRUD clientes completo
- [ ] Crear factura con items
- [ ] Reportes exportan correctamente
- [ ] Backup se ejecuta y muestra en UI
- [ ] Auditoría registra acciones

## Optional Improvements

### Security
- Considerar agregar Helmet.js para headers HTTP adicionales
- Considerar agregar security headers (CSP, HSTS)

### Testing
- Agregar Playwright/Cypress para E2E tests
- Tests de integración para APIs críticas

### Monitoring
- Agregar logs estructurados (Pino)
- Agregar métricas (Prometheus)

### Documentation
- README actualizado con URLs de producción
- API docs en Swagger: /api/docs

### Code Quality
- Agregar ESLint al backend y frontend
- Agregar Husky pre-commit hooks
- Agregar lint-staged para validar staged files

## Resources
- [PostgreSQL Best Practices](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices)
- [Playwright Testing](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices)
- [Systematic Debugging](https://skills.sh/obra/superpowers/systematic-debugging)