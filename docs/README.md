# Documentación de Vevil System

Documentación técnica del sistema Vevil.

## Índice

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** – Arquitectura, patrones, modelo de datos, seguridad.
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** – Configuración local, variables de entorno, cómo correr backend y frontend.

## Despliegue en la nube

Stack: **Supabase** (PostgreSQL), **Render** (backend NestJS), **Vercel** (frontend React/Vite).

### 1. Base de datos (Supabase)

1. Crear proyecto en [Supabase](https://supabase.com).
2. En **Settings → Database** copiar: Host, Port, User, Password, Database.
3. Ejecutar en **SQL Editor** las migraciones necesarias (crear tablas). El backend con TypeORM puede usar `synchronize: true` en desarrollo; en producción conviene aplicar migraciones SQL a mano o desactivar synchronize y usar migraciones versionadas.

Variables que necesitará el backend:

- `DB_HOST` – host de Supabase (ej. `db.xxx.supabase.co`)
- `DB_PORT` – `5432`
- `DB_USERNAME` – usuario (ej. `postgres`)
- `DB_PASSWORD` – contraseña de la base
- `DB_DATABASE` – nombre de la base (ej. `postgres`)

Conexión desde fuera de Supabase requiere **SSL**. En TypeORM configurar `ssl: { rejectUnauthorized: false }` cuando el host sea `*.supabase.co`.

### 2. Backend (Render)

1. Crear **Web Service** en [Render](https://render.com), conectar el repo de GitHub.
2. **Root Directory:** `vevil-system/backend-vevil` o `backend-vevil` según la raíz del repo.
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/src/main.js`
5. **Environment variables** (añadir en Render):

| Variable       | Descripción                          | Ejemplo                    |
|----------------|--------------------------------------|----------------------------|
| `DB_HOST`      | Host de Supabase                     | `db.xxx.supabase.co`       |
| `DB_PORT`      | Puerto PostgreSQL                    | `5432`                     |
| `DB_USERNAME`  | Usuario de la base                   | `postgres`                 |
| `DB_PASSWORD`  | Contraseña de la base                | (tu password)              |
| `DB_DATABASE`  | Nombre de la base                    | `postgres`                 |
| `JWT_SECRET`   | Secreto para tokens (generar aleatorio) | string larga           |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens     | string larga           |
| `CORS_ORIGINS` | Orígenes permitidos (frontend)       | `https://tu-app.vercel.app`|
| `FRONTEND_URL` | URL del frontend (emails, enlaces)   | `https://tu-app.vercel.app`|
| `PORT`         | Puerto interno                       | `3000`                     |

Opcional (para envío de correos: confirmación de registro, crear contraseña):

| Variable     | Descripción   |
|--------------|---------------|
| `MAIL_HOST`  | Servidor SMTP |
| `MAIL_PORT`  | Puerto SMTP   |
| `MAIL_USER`  | Usuario SMTP  |
| `MAIL_PASSWORD` | Contraseña SMTP |
| `MAIL_FROM`  | Remitente     |

### 3. Frontend (Vercel)

1. Importar proyecto en [Vercel](https://vercel.com) desde GitHub.
2. **Root Directory:** `vevil-system/frontend-vevil` (o `frontend-vevil` si el repo es solo el frontend).
3. **Framework:** Vite. Build y output por defecto (`npm run build`, `dist`).
4. **Environment variable:**

| Variable        | Descripción              | Ejemplo                          |
|-----------------|--------------------------|----------------------------------|
| `VITE_API_URL`  | URL base de la API       | `https://tu-backend.onrender.com/api` |

Si no se define `VITE_API_URL`, la app usa lógica por defecto (ej. en `*.vercel.app` apunta al backend de producción).

### 4. Verificación

- **Frontend:** abrir la URL de Vercel; login debe conectar con el backend.
- **Backend:** abrir `https://tu-backend.onrender.com/api` (o `/api/docs` si tienes Swagger); health o docs deben responder.
- **Cold start (Render plan gratis):** la primera petición puede tardar ~1 minuto; el frontend puede mostrar mensaje de “reintentar”.

### 5. Problemas frecuentes

- **Backend no arranca:** revisar que Root Directory, Build y Start Command sean correctos y que existan en el repo. Logs en Render.
- **Error “Cannot find module dist/…”:** el build de NestJS genera `dist/src/main.js`; el Start Command debe ser `node dist/src/main.js`.
- **CORS:** añadir la URL exacta del frontend (Vercel) en `CORS_ORIGINS` en Render.
- **Base de datos:** en producción no usar `synchronize: true`; aplicar migraciones SQL o usar migraciones de TypeORM.

---

**Última actualización:** 2024
