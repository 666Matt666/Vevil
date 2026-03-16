# Tests E2E – siempre en local

Los tests E2E se corren **solo en la PC**, con Postgres local (Docker) y sin usar la nube. No hace falta internet ni configurar Render/Vercel/Supabase.

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

Tarda unos minutos. Al final deberías ver algo como: **17 passed**, **5 skipped**, **0 failed**.

## Requisitos

- **Docker** (Docker Desktop o engine) para Postgres.
- **Node.js** >= 18.
- Puertos **5173**, **3001** y **3000** libres (el script intenta matar procesos en esos puertos antes de empezar).

## Tests en skip (TODO)

Hay **5 tests** marcados con `test.skip` porque fallan de forma intermitente por el flujo de perfil/admin en E2E (login → perfil en localStorage → menú admin / Settings). Están en:

- `frontend-vevil/e2e/invoices.spec.ts` – lista de facturas visible tras login.
- `frontend-vevil/e2e/registration-flow.spec.ts` – admin ve ítem “Solicitudes de registro”; admin puede abrir pantalla de solicitudes.
- `frontend-vevil/e2e/settings.spec.ts` – usuario puede abrir Configuración y ver sección Cuenta; opción Agregar huella.

Cada uno tiene un comentario `TODO: flaky en E2E por flujo perfil/admin`. Cuando se estabilice ese flujo, se puede quitar el `.skip` y corregir las aserciones.

## Correr solo algunos tests

Con backend y frontend ya levantados (por ejemplo con `npm run dev` en otra terminal, usando puertos 3000 y 5173), desde `frontend-vevil`:

```bash
cd vevil-system/frontend-vevil
npx playwright test --workers=1
```

Para un solo archivo:

```bash
npx playwright test e2e/registration-flow.spec.ts --workers=1
```

## Resumen

| Dónde | Cómo |
|-------|------|
| **PC** | `npm run e2e:local` desde `vevil-system` → Postgres local + backend :3001 + frontend :5173 + Playwright. |
| **Nube** | No se corren E2E en la nube en este flujo; el despliegue es solo al hacer push (ver [LOCAL_AND_PROD.md](./LOCAL_AND_PROD.md)). |
