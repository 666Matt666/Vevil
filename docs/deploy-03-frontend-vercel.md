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
   - Si no ponés nada, el frontend ya usa esa URL cuando el host es `*.vercel.app` (ver `frontend-vevil/src/services/api.ts`).

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
