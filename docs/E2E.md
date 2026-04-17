# Tests E2E – siempre en local

Los tests E2E se corren **solo en la PC**, con Postgres local (Docker) y sin usar la nube. No hace falta internet ni configurar Render/Vercel/Supabase.

## 📸 Flujos cubiertos (con screenshots)

Los tests E2E verifican los flujos críticos de usuario:

### 1. Login exitoso
```
1. Usuario navega a http://localhost:5173
2. Ingresa email: admin@vevil.com, password: admin123
3. Click en "Iniciar sesión"
4. Redirige a /dashboard
```
📷 *Screenshot esperado:* Dashboard cargado con menú lateral visible.

### 2. Crear factura
```
1. Menú → Facturas → Nueva factura
2. Seleccionar cliente existente
3. Agregar productos (click +)
4. Ajustar cantidades y precios
5. Guardar → "Factura creada exitosamente"
```
📷 *Screenshot esperado:* Modal de factura conlista de items, total calculado, botón "Guardar factura".

### 3. Ver auditoría
```
1. Menú → Auditoría
2. Tabla con registros: login, create, update, delete
3. Filtros por entidad, acción, usuario
4. Click "Exportar CSV" → descarga exitosa
```
📷 *Screenshot esperado:* Tabla de auditoría con columnas: Acción, Entidad, Usuario, Fecha/Hora.

> **Nota:** Los screenshots reales se guardan en `frontend-vevil/test-results/` tras ejecutar Playwright con `--trace` o `--screenshot`. Ver [Playwright docs](https://playwright.dev/docs/screenshots).

---

**Última actualización:** 17 de abril de 2026
## Cómo correr la suite

 Desde la raíz del monorepo:

```bash
cd vevil-system
npm run e2e:local
```

Ese comando:

1. Levanta Postgres con Docker (si no está).
2. Espera a que el puerto 5432 esté listo.
3. Compila el backend y lo arranca en **http://localhost:3001** con base local y seed admin E2E.
4. Arranca el frontend en **http://localhost:5173** apuntando al backend en 3001.
5. Ejecuta Playwright (Chromium) contra esa instancia local.

Tarda ~3-5 minutos. Al final deberías ver:

```
  17 passed
  5 skipped
  0 failed
```

## Requisitos

- **Docker** (Docker Desktop) para Postgres.
- **Node.js** >= 18.
- Puertos **5173**, **3001** y **5432** libres (el script `kill-port` los libera automáticamente).

## Correr solo algunos tests

Con backend y frontend ya levantados (ej: `npm run dev` en otra terminal, usando puertos 3000 y 5173), desde `frontend-vevil`:

```bash
cd vevil-system/frontend-vevil

# Todos los E2E (serial, para evitar race conditions)
npx playwright test --workers=1

# Un solo archivo
npx playwright test e2e/registration-flow.spec.ts --workers=1

# Con UI interactiva
npx playwright test --ui
```

## Tests en skip (TODO)

Hay **5 tests** marcados con `test.skip` porque fallan de forma intermitente por el flujo de perfil/admin en E2E (login → perfil en localStorage → menú admin / Settings):

- `frontend-vevil/e2e/invoices.spec.ts` – lista de facturas visible tras login.
- `frontend-vevil/e2e/registration-flow.spec.ts` – admin ve ítem "Solicitudes de registro".
- `frontend-vevil/e2e/settings.spec.ts` – usuario puede abrir Configuración y ver sección Cuenta.

Cada uno tiene un comentario `TODO: flaky en E2E por flujo perfil/admin`. Cuando se estabilice ese flujo, se puede quitar el `.skip` y corregir las aserciones.

## Reportes y artifacts

Playwright guarda:

- **Reporte HTML interactivo**: `frontend-vevil/playwright-report/`
- **Screenshots** (en fallas): `frontend-vevil/test-results/`
- **Traces** (para debugging): `frontend-vevil/test-results/` (archivos `.trace.zip`)

Para habilitar screenshots en todos los tests, editá cada spec y agregá:

```typescript
import { test as base } from '@playwright/test';
base.describe.configure({ mode: 'serial' });
```

## Troubleshooting E2E

| Problema | Causa | Solución |
|----------|-------|----------|
| `TimeoutError: navigation 30000ms exceeded` | Backend lento (cold start) | Aumentar timeout o usar `--timeout 60000` |
| `404 /api/...` | Backend no corriendo | Verificar `npm run dev` en backend-vevil |
| Login falla (credentials incorrectas) | Admin E2E no creado | Backend con `SEED_E2E_ADMIN=true` crea usuario automáticamente |
| `Database connection failed` | Postgres no listo | `docker ps` → verificar container `vevil-postgres` |

## Resumen

| Dónde | Cómo |
|-------|------|
| **PC** | `npm run e2e:local` desde `vevil-system` → Postgres local + backend :3001 + frontend :5173 + Playwright. |
| **Nube** | No se corren E2E en la nube; el despliegue es solo al hacer push (ver [LOCAL_AND_PROD.md](../LOCAL_AND_PROD.md)). |

