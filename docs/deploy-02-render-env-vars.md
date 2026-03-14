# Variables de entorno para evil-backend en Render

Si el deploy falla con **"Application exited early while running your code"**, casi siempre es por variables de entorno faltantes o incorrectas.

## Dónde configurarlas en Render

1. Entrá al servicio **evil-backend** (Projects → tu proyecto → evil-backend).
2. En el menú izquierdo: **Manage → Environment**.
3. Agregá o editá cada variable (Key = nombre, Value = valor).

## Variables obligatorias

| Key | Value | Notas |
|-----|--------|--------|
| `NODE_ENV` | `production` | Para que use lógica de producción y valide env. |
| `DB_HOST` | `db.tplcbrhlubahvuknwyjw.supabase.co` | Host de Supabase (Settings → Database). |
| `DB_PORT` | `5432` | |
| `DB_USERNAME` | `postgres` | |
| `DB_PASSWORD` | *(tu contraseña de Supabase)* | La de **Settings → Database** del proyecto, no la de S3. |
| `DB_DATABASE` | `postgres` | |
| `JWT_SECRET` | *(string largo y aleatorio)* | Ej: generá uno con `openssl rand -base64 32`. No uses el de desarrollo. |
| `JWT_REFRESH_SECRET` | *(otro string largo y aleatorio)* | Igual que arriba, otro valor. |

## Opcionales

| Key | Value |
|-----|--------|
| `CORS_ORIGINS` | `https://vevil.vercel.app,https://tu-dominio.com` (si querés restringir orígenes; si no, el backend permite localhost y *.vercel.app por defecto). |

## Después de guardar

- Guardá los cambios en Environment.
- Hacé **Manual Deploy** de nuevo para que arranque con las nuevas variables.

## Ver el error exacto

En **Logs** (pestaña Logs del servicio), buscá las líneas **justo antes** de que el proceso termine. Ahí suele aparecer:

- `❌ ERROR: Variables de entorno faltantes...` → faltan alguna de las de arriba.
- `password authentication failed` → `DB_PASSWORD` incorrecta.
- `ECONNREFUSED` → `DB_HOST` o red (ej. IPv4 en Supabase; probar Session Pooler).
