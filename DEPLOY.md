# 🚀 Guía de Deploy - Vevil System

Esta guía te ayudará a desplegar tu aplicación en la nube de forma **gratuita**.

## 📋 Arquitectura de Deploy

| Componente | Servicio | Costo |
|------------|----------|-------|
| Frontend | Vercel | **Gratis** |
| Backend | Render | **Gratis** |
| Base de datos | Supabase | **Gratis** |

---

## 🗄️ Paso 1: Configurar Base de Datos (Supabase)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Una vez creado, ve a **Project Settings** → **Database**
4. En la sección **Connection string**, selecciona **URI** y copia los datos:

   ```
   Host:     db.xxxxxxxxxxxx.supabase.co
   Database: postgres
   Port:     5432
   User:     postgres
   Password: [tu password del proyecto]
   ```

5. **Guarda estos datos**, los necesitarás para el backend

---

## ⚙️ Paso 2: Deploy del Backend (Render)

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu cuenta de GitHub/GitLab
3. Crea un nuevo **Web Service**
4. Selecciona tu repositorio
5. Configura el servicio:

   | Campo | Valor |
   |-------|-------|
   | Name | `vevil-backend` |
   | Root Directory | `vevil-system/backend-vevil` |
   | Environment | `Docker` |
   | Plan | `Free` |

6. En **Environment Variables**, agrega:

   ```
   DB_HOST=db.xxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password_de_supabase
   DB_DATABASE=postgres
   JWT_SECRET=genera_una_clave_secreta_larga_y_segura
   CORS_ORIGINS=https://tu-frontend.vercel.app
   ```

   > ⚠️ **Importante**: Para `JWT_SECRET` usa una clave segura. Puedes generar una con:
   > ```bash
   > openssl rand -base64 32
   > ```

7. Click en **Create Web Service**
8. Espera a que termine el deploy (puede tardar 5-10 minutos)
9. **Copia la URL** que te da Render (ej: `https://vevil-backend.onrender.com`)

---

## 🎨 Paso 3: Deploy del Frontend (Vercel)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Click en **Add New Project**
3. Importa tu repositorio de GitHub/GitLab
4. Configura el proyecto:

   | Campo | Valor |
   |-------|-------|
   | Framework Preset | `Vite` |
   | Root Directory | `vevil-system/frontend-vevil` |
   | Build Command | `yarn build` |
   | Output Directory | `dist` |

5. En **Environment Variables**, agrega:

   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

   > Usa la URL de Render del paso anterior + `/api`

6. Click en **Deploy**
7. ¡Listo! Tu frontend estará disponible en una URL como `https://vevil.vercel.app`

---

## 🔄 Paso 4: Actualizar CORS en Backend

Ahora que tienes la URL del frontend, vuelve a Render y actualiza:

```
CORS_ORIGINS=https://tu-proyecto.vercel.app
```

---

## 📝 Variables de Entorno - Resumen

### Backend (Render)
```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_supabase
DB_DATABASE=postgres
JWT_SECRET=tu_clave_secreta
CORS_ORIGINS=https://tu-frontend.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

---

## ⚠️ Consideraciones del Tier Gratuito

### Render (Backend)
- El servicio se **"duerme"** después de 15 minutos de inactividad
- La primera petición después de dormir tarda ~30 segundos
- 750 horas gratis por mes (suficiente para 1 servicio 24/7)

### Supabase (Base de datos)
- 500 MB de almacenamiento
- Pausa automática después de 7 días de inactividad
- Para evitar pausa: haz login en el dashboard regularmente

### Vercel (Frontend)
- 100 GB de bandwidth mensual
- Builds ilimitados
- Sin limitaciones prácticas para proyectos personales

---

## 🔧 Desarrollo Local

Para desarrollo local, crea un archivo `.env` en `backend-vevil/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=vevil_db
JWT_SECRET=desarrollo_secreto_local
CORS_ORIGINS=http://localhost:5173
```

Y en `frontend-vevil/`, crea `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🆘 Problemas Comunes

### "Connection refused" al conectar a la base de datos
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de usar el host correcto (termina en `.supabase.co`)

### CORS errors en el frontend
- Actualiza `CORS_ORIGINS` en Render con la URL exacta del frontend
- No incluyas `/` al final de la URL

### El backend tarda mucho en responder
- Es normal en el tier gratuito de Render (se "duerme")
- La primera petición tardará ~30 segundos

---

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada en:
- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://tu-backend.onrender.com`
- **API Docs**: `https://tu-backend.onrender.com/api/docs`

