# Desarrollo local (PC) y subida a PROD

**Siempre trabajamos en local.** La nube se usa solo cuando hacemos push. Este doc describe el flujo: todo en la PC con PostgreSQL local (Docker) y, al hacer **push**, que la nube use Render + Vercel + Supabase.

---

## En la PC (desarrollo)

### Opción rápida: un solo comando

Desde la raíz del monorepo (`vevil-system`):

```bash
cd vevil-system
npm install
npm run dev
```

Eso:

1. Levanta Postgres con Docker (`docker-compose up -d`) y espera a que esté listo.
2. Arranca el **backend** en `http://localhost:3000` con base de datos **local** (DB_HOST=localhost, vevil_db).
3. Arranca el **frontend** en `http://localhost:5173` con `VITE_API_URL=http://localhost:3000/api`.

No hace falta `.env.local` para esto: el script pasa las variables de DB y de API por entorno. Abrí el navegador en **http://localhost:5173**.

### Opción por partes

- **Solo Postgres:** `npm run dev:up` (desde `vevil-system`).
- **Solo backend** (con DB local): `npm run dev:backend` (desde `vevil-system`).
- **Solo frontend** (apuntando al backend local): `npm run dev:frontend` (desde `vevil-system`).
- **Bajar Postgres:** `npm run dev:down`.

Si preferís correr backend y frontend desde sus carpetas:

- Backend con base local: creá `backend-vevil/.env.local` (copiá de `.env.local.example`) con `DB_HOST=localhost`, etc.
- Frontend: creá `frontend-vevil/.env.local` con `VITE_API_URL=http://localhost:3000/api` (o usá `.env.local.example`).

---

## E2E en la PC

Para correr todos los tests E2E **sin internet** y usando la base local:

- Desde `vevil-system`:  
  `npm run e2e:local`

- O desde `vevil-system/frontend-vevil`:  
  `npm run e2e:full:local`

Ese script levanta Postgres (si no está), espera el puerto 5432, hace build del backend, lo arranca en 3001 con DB local y seed admin E2E, arranca el frontend en 5173 y ejecuta Playwright. No usa Supabase.

---

## Al hacer push: todo en la nube (PROD)

Cuando terminaste de desarrollar y probar en local:

1. **Commit y push** del branch que usás para producción (ej. `main`):

   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```

2. **En la nube** (Render + Vercel ya conectados al repo):

   - **Render** hace deploy del backend al push. Las variables de entorno (Supabase, JWT, etc.) se configuran **solo en el dashboard de Render**; el backend en PROD usa esa base y secretos, no los de tu PC.
   - **Vercel** hace deploy del frontend al push. La variable **`VITE_API_URL`** en Vercel debe apuntar a la URL del backend en Render (ej. `https://evil-backend.onrender.com/api`). El código ya usa esa URL cuando el host es `vercel.app`.

No hace falta cambiar nada en el código para “modo nube”: al hacer push, cada servicio usa sus variables de entorno en la nube. La base de datos en PROD es la de Supabase configurada en Render; la base local de tu PC no se usa.

**Resumen**

| Dónde   | Cómo corre |
|--------|------------|
| **PC** | `npm run dev` desde `vevil-system` → Postgres local + backend :3000 + frontend :5173 con API local. |
| **Nube** | Push a `main` → Render (backend + Supabase) y Vercel (frontend con `VITE_API_URL` → Render). |
