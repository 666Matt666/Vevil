# Backend Vevil (NestJS)

API REST del sistema Vevil. En local usa PostgreSQL (Docker); en producción usa la base en la nube (Supabase).

## Requisitos

- Node.js >= 18
- PostgreSQL 15 (o Docker)
- Variables de entorno (ver abajo)

## Desarrollo local

```bash
# Desde vevil-system (recomendado)
cd vevil-system
npm install
npm run dev   # levanta Postgres + backend + frontend

# Solo backend (con .env en backend-vevil)
cd backend-vevil
npm install
npm run start:dev
```

- **API:** http://localhost:3000/api  
- **Swagger:** http://localhost:3000/api/docs  

## Variables de entorno

Copia `.env.local.example` a `.env` o `.env.local`. Mínimo para local:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`

Ver [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) y [docs/README.md](../docs/README.md) para producción.

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo watch |
| `npm run build` | Compilar para producción |
| `npm run test` | Tests unitarios (Jest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Cobertura de tests |
| `npm run migration:run` | Ejecutar migraciones (requiere DB levantada) |
| `npm run migration:generate -- src/migrations/Nombre` | Generar migración |
| `npm run seed:examples` | Datos de ejemplo |
| `npm run create:admin` | Crear usuario admin |

## Tests unitarios

Los módulos **auth**, **users**, **invoices**, **customers**, **products** y **audit** tienen tests unitarios (`.spec.ts`). Ejecutar:

```bash
npm test
npm test -- --testPathPattern=audit
npm run test:cov
```

## Documentación API (Swagger)

Con el servidor en marcha: **http://localhost:3000/api/docs**. Incluye autenticación Bearer (JWT).

## Health check

`GET /api/health` devuelve `{ "status": "ok" }`. Útil para Render, scripts o comprobar que el backend responde (por ejemplo después de `npm run dev`).

## Más documentación

- [Guía de desarrollo (DEVELOPMENT.md)](../docs/DEVELOPMENT.md)
- [Local vs PROD (LOCAL_AND_PROD.md)](../docs/LOCAL_AND_PROD.md)
- [Despliegue y arquitectura](../docs/README.md)
- [Checklist para llevar auditoría a PROD](../docs/RELEASE_AUDIT_TO_PROD.md)
