# Paso 1: Base de datos PostgreSQL en la nube

> **Atención:** Este archivo es **solo documentación** (guía de pasos). **No lo pegues en el SQL Editor de Supabase** — daría error de sintaxis. En el SQL Editor solo se ejecuta el archivo **`docs/supabase-reset-schema.sql`** cuando quieras resetear el esquema (ver sección "Empezar de cero la BD").

Dejar la base de datos en la nube primero. Así después solo conectás el backend (y más adelante el frontend) sin tocar la BD de nuevo.

**Referencia (tu cuenta):** 666Matt666 · mdibella@gmail.com · Proyecto: *666Matt666's Project*. Las credenciales de conexión (host, contraseña de `postgres`) se obtienen en **Settings → Database** de ese proyecto.

---

## Opción recomendada: Supabase

Supabase ofrece PostgreSQL gestionado con plan gratuito. El backend ya está preparado para conectarse con SSL a un host `*.supabase.co`.

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta si no tenés.
2. **New project**: elegí organización, nombre del proyecto (ej. `vevil`), contraseña para el usuario `postgres` (guardala bien).
3. Región: la más cercana a tus usuarios.
4. Esperá a que el proyecto esté listo.

### 2. Obtener las credenciales de conexión

En el proyecto (*666Matt666's Project* → **Settings** → **Database**):

1. **Settings** (ícono de engranaje) → **Database**.
2. En **Connection string** elegí **URI** y copiá la cadena. O anotá por separado:
   - **Host**: `db.xxxxxxxx.supabase.co` (el `xxxxxxxx` es el ref de tu proyecto; lo ves en la misma pantalla).
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: la contraseña que definiste al crear el proyecto (si no la recordás, en **Database** hay opción para restablecerla).

Ejemplo de **Connection string** → **URI**:

```
postgresql://postgres:[PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
```

Reemplazá `[PASSWORD]` por tu contraseña real. Si tiene caracteres especiales, puede que tengas que codificarlos en la URL (por ejemplo `@` → `%40`).

### 3. Crear un archivo `.env` en el backend (solo para este paso)

En la carpeta **`vevil-system/backend-vevil/`** creá un archivo `.env` con las variables de la BD en la nube. Usá el **Host** y la **Password** que anotaste en el paso anterior:

```env
DB_HOST=db.xxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=la_contraseña_del_usuario_postgres_del_proyecto
DB_DATABASE=postgres
```

- Reemplazá `db.xxxxxxxx.supabase.co` por el host real (Settings → Database).
- Reemplazá `la_contraseña_del_usuario_postgres_del_proyecto` por la contraseña del usuario `postgres` de ese proyecto.

No subas este archivo a Git (`.env` debería estar en `.gitignore`).

### 4. Aplicar el esquema (migraciones) a la BD en la nube

Con la BD vacía en Supabase, ejecutá las migraciones desde tu máquina:

```powershell
cd c:\Workspace\Vevil\vevil-system\backend-vevil
npm run migration:run
```

Eso compila el backend y ejecuta las migraciones: primero el esquema inicial (tablas `user`, `customer`, `product`, `invoice`, `invoice_item`, `payment` y `migrations`) y luego la que habilita **Row Level Security (RLS)** en todas esas tablas. Con RLS activo y sin políticas, el acceso vía PostgREST (anon key) no devuelve filas; el backend NestJS se conecta con el usuario `postgres` y bypasea RLS, así que sigue funcionando igual. Si todo va bien, no verás errores.

### 5. Comprobar que la BD quedó bien

- En Supabase: **Table Editor**. Deberías ver las tablas (aunque vacías) y la tabla `migrations` con una fila.
- Opcional: desde el backend en local, probá conectarte a la BD de Supabase abriendo el `.env` con esas variables y ejecutando `npm run start:dev`. Si arranca sin errores de conexión, la BD en la nube está lista para cuando subas el backend.

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | Crear proyecto en Supabase y anotar contraseña |
| 2 | Copiar host, puerto, usuario, contraseña y database |
| 3 | Crear `backend-vevil/.env` con `DB_*` apuntando a Supabase |
| 4 | Ejecutar `npm run migration:run` en `backend-vevil` |
| 5 | Revisar en Table Editor que existan las tablas |
| 6 | (Opcional) Revisar **Security Advisor**: con RLS habilitado (migración `EnableRLS`) no deberían quedar errores de "RLS Disabled in Public". |

Cuando sigas con el **Paso 2** (subir el backend a Render), esas mismas variables `DB_*` las configurás en el **Environment** de Render; la BD ya va a estar creada y con el esquema aplicado.

---

## Si usás otro proveedor de PostgreSQL

Si en vez de Supabase usás otro servicio (p.ej. Neon, Railway, Aiven):

- Configurá `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` con los datos que te den.
- Si el host es de internet y usa SSL, puede que tengas que activar SSL en el backend (hoy está preparado para `supabase.co`). En ese caso se puede agregar una variable tipo `DB_SSL=true` y usarla en `app.module.ts` y en `data-source.ts`.

Con la BD en la nube y las migraciones corridas, el **Paso 1** está listo.

---

## Probar la app solo con la BD en la nube

Para probar que todo funciona **con backend y frontend en tu máquina** y **solo la base de datos en Supabase**:

1. **No levantes PostgreSQL local** (si usás Docker, no hagas `docker-compose up` para la BD, o usá otro proyecto sin BD local).

2. **`.env` en `backend-vevil/`** con las variables de Supabase (y al menos `JWT_SECRET` para que el backend no falle):
   ```env
   DB_HOST=db.xxxxxxxx.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_contraseña_postgres_del_proyecto
   DB_DATABASE=postgres
   JWT_SECRET=alguna_clave_secreta_para_probar
   ```
   Usá el mismo **Host** y **Password** que en Settings → Database del proyecto. Opcional: `JWT_REFRESH_SECRET=otra_clave` si usás refresh token. No hace falta `CORS_ORIGINS` para probar en local (el backend ya permite localhost por defecto).

3. **Backend** (en una terminal):
   ```powershell
   cd c:\Workspace\Vevil\vevil-system\backend-vevil
   npm run start:dev
   ```
   Deberías ver en consola que se conecta a la BD (Host: tu `db.xxx.supabase.co`, SSL: Sí). Si hay error de conexión, revisá host, contraseña y que el proyecto Supabase esté activo (no pausado).

4. **Frontend** (en otra terminal):
   ```powershell
   cd c:\Workspace\Vevil\vevil-system\frontend-vevil
   npm run dev
   ```
   Abrí http://localhost:5173. La app React usa por defecto `http://localhost:3000/api` cuando corre en localhost, así que las peticiones van a tu backend local y este usa la BD en Supabase.

5. **Probar**: Registro, login, crear clientes/productos/facturas. Los datos se guardan en Supabase; podés comprobarlo en **Table Editor**.

**Importante:** Cuando la BD es Supabase (host `*.supabase.co`), el backend **no** usa `synchronize` aunque corras en local. Así no se modifica el esquema en la nube; los cambios de esquema se hacen con migraciones (`npm run migration:run`).

---

## Poblar la BD en la nube con los datos de tu PC

Si tenés datos en la base local (por ejemplo PostgreSQL en Docker con `vevil_db`) y querés copiarlos a Supabase:

1. **Levantá la base local** (si usás Docker: `docker-compose up -d postgres` en la raíz del repo).
2. **Dejá el `.env` del backend apuntando a Supabase** (`DB_HOST`, `DB_PASSWORD`, etc.). El script usa esas variables para el **destino** y, para el origen, asume por defecto `localhost` / `vevil_db` / usuario `postgres` / contraseña `admin`. Si tu local usa otros valores, podés definir en el `.env`: `DB_LOCAL_HOST`, `DB_LOCAL_PORT`, `DB_LOCAL_USERNAME`, `DB_LOCAL_PASSWORD`, `DB_LOCAL_DATABASE`.
3. Desde la carpeta del backend ejecutá:
   ```powershell
   cd c:\Workspace\Vevil\vevil-system\backend-vevil
   npm run db:copy-local-to-supabase
   ```
   El script copia en orden: **user**, **customer**, **product**, **invoice**, **invoice_item**, **payment**, y ajusta las secuencias para que los próximos inserts tengan IDs correctos. Si una fila ya existe en Supabase (mismo `id`), se omite (`ON CONFLICT DO NOTHING`).

---

## Empezar de cero la BD en Supabase (esquema viejo)

Si en Supabase tenés un esquema viejo (otras tablas, columnas como `customer.user_id`, etc.) o la migración falla con "ya existe un tipo user_role_enum", querés dejar la BD como la define el código actual.

### Instrucciones paso a paso (reset en Supabase)

1. Entrá a [supabase.com](https://supabase.com) e iniciá sesión.
2. Abrí tu proyecto (*666Matt666's Project* o el que uses).
3. En el menú izquierdo, entrá a **SQL Editor**.
4. Clic en **New query** (nueva consulta).
5. Copiá **solo** el bloque SQL de abajo (las líneas `DROP TABLE` y `DROP TYPE`). No copies títulos ni texto de este .md.
6. Pegá el SQL en el editor y hacé clic en **Run** (o Ctrl+Enter).
7. Si todo va bien, verás "Success" y las tablas/tipo habrán sido borrados.
8. Después, en tu máquina, con el `.env` del backend apuntando a Supabase, ejecutá:
   ```powershell
   cd c:\Workspace\Vevil\vevil-system\backend-vevil
   npm run migration:run
   ```
   Con eso se recrean las tablas y podés usar la app.

---

**Bloque SQL para pegar en el SQL Editor** (solo esto, nada más):

```sql
DROP TABLE IF EXISTS "migrations" CASCADE;
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "invoice_item" CASCADE;
DROP TABLE IF EXISTS "invoice" CASCADE;
DROP TABLE IF EXISTS "product" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TYPE IF EXISTS "user_role_enum" CASCADE;
```

Después de ejecutar el SQL y correr `npm run migration:run`, la BD queda alineada con el código: **user**, **customer**, **product**, **invoice**, **invoice_item**, **payment** y **migrations**.
