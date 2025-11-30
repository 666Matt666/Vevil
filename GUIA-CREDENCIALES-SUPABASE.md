# 🔑 Guía: Cómo Obtener las Credenciales de Supabase

## 📍 Dónde Encontrar las Credenciales

### Paso 1: Acceder a tu Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o créalo si no existe)

### Paso 2: Ir a la Configuración de Base de Datos

1. En el menú lateral izquierdo, haz click en **⚙️ Settings** (Configuración)
2. Luego haz click en **🗄️ Database** (Base de datos)

### Paso 3: Encontrar las Credenciales

En la página de Database, verás varias secciones. Necesitas la sección **"Connection string"** o **"Connection pooling"**.

---

## 🔑 Credenciales que Necesitas

### Opción 1: Connection String (Recomendado)

Busca la sección **"Connection string"** o **"Connection info"**. Verás algo como:

```
Host: db.abcdefghijklmnop.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [tu_password_aquí]
```

**Las credenciales que necesitas son:**

| Variable | Valor de Ejemplo | Descripción |
|----------|------------------|-------------|
| **DB_HOST** | `db.abcdefghijklmnop.supabase.co` | El host de tu base de datos (termina en `.supabase.co`) |
| **DB_PORT** | `5432` | Puerto de PostgreSQL (siempre 5432) |
| **DB_USERNAME** | `postgres` | Usuario (generalmente `postgres`) |
| **DB_PASSWORD** | `tu_password_secreto` | La contraseña que configuraste al crear el proyecto |
| **DB_DATABASE** | `postgres` | Nombre de la base de datos (generalmente `postgres`) |

### Opción 2: Connection String URI

También puedes encontrar una **URI completa** que se ve así:

```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

Si tienes esta URI, puedes extraer las credenciales:
- **Host**: La parte después de `@` y antes de `:5432` → `db.abcdefghijklmnop.supabase.co`
- **Port**: `5432`
- **Username**: `postgres` (antes del `:`)
- **Password**: La parte entre `postgres:` y `@` → `[YOUR-PASSWORD]`
- **Database**: `postgres` (después del último `/`)

---

## 📝 Ejemplo Completo

Supongamos que en Supabase ves:

```
Host: db.xyz123abc456.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: MiPasswordSecreto123!
```

Entonces las variables que debes configurar en Fly.io son:

```bash
DB_HOST=db.xyz123abc456.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=MiPasswordSecreto123!
DB_DATABASE=postgres
```

---

## ⚠️ Importante

1. **La contraseña**: Es la que configuraste cuando creaste el proyecto en Supabase. Si la olvidaste, puedes:
   - Resetearla en Settings → Database → Reset database password
   - O crear un nuevo proyecto

2. **El Host**: Siempre termina en `.supabase.co`
   - Formato: `db.xxxxxxxxxxxx.supabase.co`
   - Donde `xxxxxxxxxxxx` es un identificador único de tu proyecto

3. **Seguridad**: 
   - ⚠️ **NUNCA** compartas estas credenciales públicamente
   - ⚠️ **NUNCA** las subas a GitHub
   - ✅ Solo úsalas en las variables de entorno de Fly.io

---

## 🔍 Si No Encuentras las Credenciales

### Si no ves "Connection string":
1. Asegúrate de estar en **Settings** → **Database**
2. Busca la sección **"Connection info"** o **"Connection pooling"**
3. Puede estar en una pestaña llamada **"Connection string"** o **"URI"**

### Si no tienes contraseña:
1. Ve a **Settings** → **Database**
2. Busca el botón **"Reset database password"** o **"Change database password"**
3. Configura una nueva contraseña y guárdala

---

## ✅ Verificación

Una vez que tengas las credenciales, puedes verificar que son correctas intentando conectarte con un cliente de PostgreSQL o usando las herramientas de Supabase.

---

## 📚 Siguiente Paso

Una vez que tengas estas credenciales, ve al **Paso 2** del `CHECKLIST-DEPLOY.md` para configurarlas en Fly.io.

