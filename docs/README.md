# Documentación de Vevil System

Documentación técnica del sistema Vevil.

## 📚 Índice completo

### Guías principales
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** – Arquitectura, patrones, modelo de datos, seguridad.
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** – Configuración local, variables de entorno, tests, debugging, troubleshooting.
- **[DEPLOY.md](./DEPLOY.md)** – Despliegue automatizado (Render, Vercel, Supabase), CI/CD con GitHub Actions, migraciones.
- **[PRE_DEPLOY_LOCAL_CHECK.md](./PRE_DEPLOY_LOCAL_CHECK.md)** – Checklist local antes del deploy (script + verificación en navegador).
- **[E2E.md](./E2E.md)** – Tests E2E con Playwright: flujos cubiertos, troubleshooting, screenshots.
- **[LOCAL_AND_PROD.md](./LOCAL_AND_PROD.md)** – Desarrollo local con Postgres Docker; despliegue a producción.
- **[RELEASE_AUDIT_TO_PROD.md](./RELEASE_AUDIT_TO_PROD.md)** – Checklist para llevar auditoría a PROD (migración, verificación).

### Guías de contribución y mejores prácticas
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** – Cómo contribuir: flujo Git, convenciones de commits, PR template, code review.
- **[AGENTS.md](./AGENTS.md)** – Mejores prácticas aplicadas: React/NestJS/PostgreSQL/Testing (skills activas).
- **[SKILLS.md](./SKILLS.md)** – Skills instaladas, cómo agregar nuevas, revisión semanal automática.

### Recursos externos
- [NestJS Best Practices](https://skills.sh/kadajett/agent-nestjs-skills/nestjs-best-practices)
- [Vercel React Best Practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)
- [Supabase PostgreSQL Best Practices](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices)
- [Playwright Testing](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices)

---

## Guía de uso (funcionalidades para el usuario)

- **Sesión expirada:** Si el token de sesión vence, la app redirige al login y muestra el mensaje *“Sesión expirada. Volvé a iniciar sesión.”* Basta con volver a iniciar sesión.
- **Listas paginadas:** En Productos, Clientes, Facturas y Auditoría las listas están paginadas. Podés cambiar de página con los botones *Anterior* / *Siguiente* y los números de página. Los filtros (búsqueda, tipo, categoría, departamento, estado, fechas) se aplican en el servidor y la paginación refleja los resultados filtrados.
- **Confirmación antes de borrar:** Al eliminar un producto, un cliente o una factura, se muestra un modal de confirmación. Hay que aceptar para que se ejecute la acción (no se puede deshacer).
- **Exportar auditoría:** En la vista **Auditoría** hay un botón *Exportar CSV* en la parte superior. Descarga un archivo CSV con los registros actuales (según filtros y página). Útil para respaldos o análisis en Excel.
- **Editar y eliminar facturas:** Los administradores pueden editar y eliminar facturas que estén en estado "Pendiente" o "Anulada". Las facturas "Pagadas" no pueden modificarse. Al hacer clic en ✏️ (editar) se abre un modal donde se puede cambiar:
  - Cliente
  - Moneda
  - Estado
  - Productos (agregar, eliminar o modificar cantidades)
  Al hacer clic en 🗑️ (eliminar) se pide confirmación antes de borrar la factura.
- **Editar y eliminar clientes y productos:** Los administradores pueden editar y eliminar clientes y productos desde sus respective listas. Al hacer clic en ✏️ (editar) se abre un modal con los datos del registro para modificar. Al hacer clic en 🗑️ (eliminar) se pide confirmación antes de borrar.

---

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

**Login con huella (WebAuthn):**

| Variable           | Descripción                                      | Ejemplo                         |
|--------------------|--------------------------------------------------|---------------------------------|
| `WEBAUTHN_RP_ID`   | Dominio del Relying Party (debe ser el del frontend) | `tu-app.vercel.app` o `localhost` |
| `WEBAUTHN_ORIGIN`  | Origen permitido (URL completa del frontend)      | `https://tu-app.vercel.app` o `http://localhost:5173` |

Si no se definen, el backend usa el host/origen derivado de `FRONTEND_URL`. En producción conviene fijarlos para evitar problemas entre dominios.

**Tabla para WebAuthn:** si usás login con huella, ejecutá en Supabase (SQL Editor) la siguiente migración una vez:

```sql
CREATE TABLE IF NOT EXISTS "webauthn_credential" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "credentialId" VARCHAR(500) NOT NULL,
  "publicKey" TEXT NOT NULL,
  "counter" INT NOT NULL DEFAULT 0,
  "deviceType" VARCHAR(100) NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_webauthn_credential_id" ON "webauthn_credential" ("credentialId");
CREATE INDEX IF NOT EXISTS "IDX_webauthn_credential_userId" ON "webauthn_credential" ("userId");
```

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

### 5. WebAuthn (huella / passkey)

- **Flujo:** el usuario inicia sesión con email y contraseña, entra en **Configuración → Cuenta** y pulsa **Agregar huella**. A partir de ahí puede usar **Iniciar con huella** en el login (solo email + huella).
- **Probar en local:** backend con `FRONTEND_URL=http://localhost:5173`; si no ponés `WEBAUTHN_RP_ID`/`WEBAUTHN_ORIGIN`, se usan `localhost` y `http://localhost:5173`. El navegador debe soportar WebAuthn (Chrome/Edge con dispositivo o simulador).
- **Seguridad:** el servidor guarda el challenge al generar opciones y lo valida en verify (un solo uso, TTL 5 min).

### 6. Problemas frecuentes

- **Backend no arranca:** revisar que Root Directory, Build y Start Command sean correctos y que existan en el repo. Logs en Render.
- **Error “Cannot find module dist/…”:** el build de NestJS genera `dist/src/main.js`; el Start Command debe ser `node dist/src/main.js`.
- **CORS:** añadir la URL exacta del frontend (Vercel) en `CORS_ORIGINS` en Render.
- **Base de datos:** en producción no usar `synchronize: true`; aplicar migraciones SQL o usar migraciones de TypeORM.

---

**Última actualización:** 2024
