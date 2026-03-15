# Desplegar el frontend en Vercel (todo en la nube)

Con el backend en Render y la base de datos en Supabase, solo falta publicar el frontend en **Vercel** para usar la app sin ejecutar nada en tu PC.

## Requisitos

- Cuenta en [Vercel](https://vercel.com) (con GitHub).
- Repositorio en GitHub con el código (por ejemplo `666Matt666/Vevil`).

## Pasos en Vercel

1. **Importar el proyecto**
   - Entrá a [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Conectá tu cuenta de GitHub si hace falta y elegí el repo **Vevil**.

2. **Configurar el proyecto**
   - **Root Directory:** `vevil-system/frontend-vevil` (carpeta del frontend).
   - **Framework Preset:** Vite (Vercel lo detecta solo).
   - **Build Command:** `npm run build` (por defecto).
   - **Output Directory:** `dist` (por defecto con Vite).

3. **Variables de entorno (opcional)**
   - Si querés fijar la API por variable: **Environment Variables** → agregar:
     - `VITE_API_URL` = `https://evil-backend.onrender.com/api`
   - **Importante:** No uses `VITE_API_URL` apuntando a Fly.io ni a otra URL vieja. El frontend en `*.vercel.app` usa siempre el backend en Render; si tenés una variable antigua, borrala o actualizala.
   - Si en la consola del navegador (F12) ves peticiones a `vevil-dtt7ta.fly.dev`, hacé un **hard refresh** (Ctrl+Shift+R) o borrá `VITE_API_URL` en Vercel y volvé a desplegar.

4. **Deploy**
   - **Deploy**. Vercel construye y publica; te da una URL tipo `tu-proyecto.vercel.app`.

## Después del deploy

- **Login:** Abrí la URL de Vercel (ej. `https://vevil.vercel.app`) y usá el login con un usuario que exista en la BD de Supabase.
- **Backend:** Las peticiones van a `https://evil-backend.onrender.com/api` (Render).
- **CORS:** El backend en Render ya permite `*.vercel.app`; si usás otro dominio, agregalo en la variable `CORS_ORIGINS` del servicio evil-backend en Render.

## Resumen “todo en la nube”

| Componente | Dónde está |
|------------|------------|
| Base de datos | Supabase |
| Backend API | Render → `https://evil-backend.onrender.com` |
| Frontend (login, app) | Vercel → `https://tu-proyecto.vercel.app` |

No hace falta correr backend ni frontend en tu PC; solo abrís la URL de Vercel en el navegador.

## Notas

- **Cold start (Render plan gratis):** La primera vez que entrás al login o después de unos minutos sin uso, el backend puede tardar ~1 minuto en responder. En la pantalla de login se muestra el mensaje "La primera vez puede tardar unos segundos." y el botón "Reintentar" espera a que el servidor despierte antes de intentar de nuevo.
- **Si la consola muestra Fly.io:** Si en F12 → Console ves peticiones a `vevil-dtt7ta.fly.dev`, el front está usando una URL vieja. Solución: hard refresh (Ctrl+Shift+R), o en Vercel → Settings → Environment Variables borrá o actualizá `VITE_API_URL` y volvé a desplegar.
