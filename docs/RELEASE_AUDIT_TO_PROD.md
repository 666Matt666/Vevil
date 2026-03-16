# Checklist: Llevar Auditoría a PROD

Cuando quieras activar la **auditoría** (tabla `audit_log` y endpoint de consulta) en producción **sin tocar** lo que ya está en PROD hasta entonces, seguí este checklist.

**Deploy automatizado:** Ver [DEPLOY.md](./DEPLOY.md) para el flujo completo (push → migraciones automáticas en Render → deploy). Este checklist es para la primera vez que activás auditoría o si corrés migraciones a mano.

---

## 1. Base de datos (Supabase / PROD)

- [ ] Ejecutar la migración en la base de producción:
  - **Recomendado (automático):** Si el backend en Render tiene `preDeployCommand: npm run migration:run:prod` (ver `backend-vevil/render.yaml`), al hacer el próximo deploy las migraciones se ejecutan solas. Solo hace falta hacer push a `main`.
  - Opción manual desde PC (con variables de PROD en `.env`):
    ```bash
    cd backend-vevil
    # Ajustar .env con DB_HOST, DB_* de Supabase
    npm run migration:run
    ```
  - Opción manual en Supabase (SQL Editor): ejecutá el siguiente SQL (respaldo por si no usás pre-deploy):
    ```sql
    CREATE TABLE "audit_log" (
      "id" SERIAL NOT NULL,
      "userId" uuid,
      "userEmail" character varying(255),
      "action" character varying(64) NOT NULL,
      "entityType" character varying(32) NOT NULL,
      "entityId" character varying(64),
      "oldValue" jsonb,
      "newValue" jsonb,
      "ip" character varying(45),
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
    );
    CREATE INDEX "IDX_audit_log_userId" ON "audit_log" ("userId");
    CREATE INDEX "IDX_audit_log_entityType_entityId" ON "audit_log" ("entityType", "entityId");
    CREATE INDEX "IDX_audit_log_createdAt" ON "audit_log" ("createdAt");
    ```

- [ ] Verificar que la tabla `audit_log` existe y tiene índices en `userId`, `(entityType, entityId)` y `createdAt`.

---

## 2. Backend (Render)

- [ ] El código ya incluye el módulo de auditoría. Tras el próximo deploy (push a `main`), el backend:
  - Sigue registrando acciones en `audit_log` (create/update/delete en invoices, customers, products y login).
  - Expone `GET /api/audit` (protegido con JWT). Query params: `userId`, `entityType`, `entityId`, `limit`.

- [ ] No hace falta agregar variables de entorno nuevas para la auditoría.

- [ ] El health check en `render.yaml` está en `/api/health` (responde `{ "status": "ok" }`).

---

## 3. Frontend (Vercel)

- [ ] La vista real de auditoría (`AuditLogView`) ya está en el código: tabla con filtros por usuario, tipo de entidad, ID y límite. La ruta `/audit` la usa. Tras el deploy, si la migración ya corrió en Supabase, la pantalla cargará los datos; si no, verás "Error al cargar auditoría" hasta que ejecutes la migración.

---

## 4. Verificación en PROD

- [ ] Tras el deploy, hacer login y una acción (ej. crear una factura o un cliente).
- [ ] Comprobar en Supabase que en `audit_log` aparece un registro nuevo (o llamar a `GET /api/audit` con un token válido y ver que devuelve datos).
- [ ] Verificar que el frontend en `/audit` responde como esperás (placeholder o vista real).

---

## 5. Recordatorio

- **No modificar PROD** hasta que estés listo: este checklist es para cuando decidas activar la auditoría.
- Los **unit tests** del backend (audit service y controller) y del frontend (ComingSoon) ya están en el repo; podés correrlos en local con `npm test` en `backend-vevil` y `frontend-vevil`.

---

**Última actualización:** 2025
