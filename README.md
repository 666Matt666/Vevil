# Vevil System

Backend (NestJS) + frontend (React/Vite). **En la PC** todo corre con Postgres local; **al hacer push** la nube usa Render + Vercel + Supabase.

## Flujo de trabajo

**Siempre trabajamos en local.** La nube (Render, Vercel, Supabase) se usa solo cuando hacemos push a `main`. No hace falta configurar ni tocar la nube hasta que quieras desplegar.

## Desarrollo en la PC

```bash
cd vevil-system
npm install
npm run dev
```

- Levanta Postgres (Docker), backend en **http://localhost:3000** y frontend en **http://localhost:5173**.
- Backend usa base local; frontend apunta a `http://localhost:3000/api`.
- Si es la primera vez o añadiste migraciones: `npm run db:migrate` (desde `vevil-system`) después de que Postgres esté arriba.

## E2E en la PC

```bash
npm run e2e:local
```

(Desde `vevil-system`; usa Postgres local y no requiere internet.)

## Subir a PROD (nube)

```bash
git add .
git commit -m "mensaje"
git push origin main
```

Render y Vercel despliegan automáticamente. El backend en la nube usa las variables de Render (Supabase, JWT); el frontend usa `VITE_API_URL` configurada en Vercel.

Más detalle: [docs/LOCAL_AND_PROD.md](./docs/LOCAL_AND_PROD.md).
