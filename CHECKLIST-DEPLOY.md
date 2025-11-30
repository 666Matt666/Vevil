# ✅ Checklist de Despliegue - Vevil System

## Estado Actual

### ✅ Backend (Fly.io)
- **Estado**: Configurado y desplegado
- **URL**: `https://vevil-dtt7ta.fly.dev/api`
- **CORS**: ✅ Configurado para permitir Vercel (`.vercel.app` y `.vercel.dev`)

### ⚠️ Frontend (Vercel)
- **Estado**: Configurado pero **FALTA VERIFICAR** si está desplegado
- **Archivo**: `vercel.json` existe
- **Falta**: URL del frontend y variable de entorno `VITE_API_URL`

### ❓ Base de Datos (Supabase)
- **Estado**: **NO CONFIRMADO** si está en la nube
- **Local**: Existe base de datos local en `postgres_data/`
- **Falta**: Verificar si existe proyecto en Supabase y configurar variables en Fly.io

---

## 📋 Pasos para Completar el Despliegue

### Paso 1: Verificar/Crear Base de Datos en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Si no tienes proyecto:
   - Click en **"New Project"**
   - Nombre: `vevil-db` (o el que prefieras)
   - Contraseña: **GUÁRDALA BIEN** (la necesitarás)
   - Región: Elige la más cercana
   - Click en **"Create new project"**
3. Una vez creado, ve a **Settings** → **Database**
4. En **Connection string**, selecciona **URI** y copia:
   - **Host**: `db.xxxxxxxxxxxx.supabase.co`
   - **Database**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: [la que configuraste al crear el proyecto]

**✅ Marca este paso cuando tengas los datos de Supabase**

---

### Paso 2: Configurar Variables de Entorno en Fly.io

1. Ve a [fly.io](https://fly.io) e inicia sesión
2. Ve a tu app `vevil-dtt7ta`
3. Ve a **Secrets** o **Environment Variables**
4. Agrega/Verifica estas variables:

```bash
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_de_supabase
DB_DATABASE=postgres
JWT_SECRET=tu_clave_secreta_larga_y_segura
```

> 💡 **Generar JWT_SECRET**: Si no tienes uno, ejecuta:
> ```bash
> openssl rand -base64 32
> ```

5. Después de agregar las variables, reinicia la app:
   ```bash
   flyctl restart -a vevil-dtt7ta
   ```

**✅ Marca este paso cuando hayas configurado las variables**

---

### Paso 3: Verificar/Desplegar Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Verifica si ya tienes un proyecto desplegado:
   - Si **SÍ existe**: Anota la URL (ej: `https://vevil.vercel.app`)
   - Si **NO existe**: Continúa con el paso 4

3. Si ya existe, verifica las variables de entorno:
   - Ve a **Settings** → **Environment Variables**
   - Verifica que exista:
     ```
     VITE_API_URL=https://vevil-dtt7ta.fly.dev/api
     ```
   - Si no existe, agrégalo y haz un nuevo deploy

**Si NO existe el proyecto, continúa:**

4. Click en **"Add New Project"**
5. Importa tu repositorio de GitHub/GitLab
6. Configura:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `vevil-system/frontend-vevil`
   - **Build Command**: `npm run build` (o `yarn build`)
   - **Output Directory**: `dist`
7. En **Environment Variables**, agrega:
   ```
   VITE_API_URL=https://vevil-dtt7ta.fly.dev/api
   ```
8. Click en **Deploy**
9. Espera a que termine el deploy
10. **Copia la URL** que te da Vercel (ej: `https://vevil.vercel.app`)

**✅ Marca este paso cuando tengas la URL del frontend**

---

### Paso 4: Verificar Conexión

1. Abre la URL de tu frontend en Vercel
2. Intenta hacer login
3. Si funciona: ✅ **¡Despliegue completo!**
4. Si hay errores:
   - Revisa la consola del navegador (F12)
   - Verifica que el backend esté respondiendo: `https://vevil-dtt7ta.fly.dev/api`
   - Verifica las variables de entorno en Fly.io y Vercel

---

## 🔍 Verificaciones Rápidas

### Backend funcionando:
```bash
curl https://vevil-dtt7ta.fly.dev/api
```

### Frontend conectado:
- Abre la consola del navegador (F12)
- Deberías ver: `✅ Using production backend: https://vevil-dtt7ta.fly.dev/api`

### Base de datos conectada:
- Revisa los logs de Fly.io
- No debería haber errores de conexión a la base de datos

---

## 📝 Resumen de URLs

Una vez completado, deberías tener:

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://vevil-dtt7ta.fly.dev/api`
- **API Docs**: `https://vevil-dtt7ta.fly.dev/api/docs`
- **Base de Datos**: Supabase (solo accesible desde el backend)

---

## 🆘 Problemas Comunes

### Error: "Connection refused" en backend
- Verifica que las credenciales de Supabase sean correctas en Fly.io
- Verifica que el host termine en `.supabase.co`

### Error: CORS en frontend
- El CORS ya está configurado para `.vercel.app`
- Si usas un dominio personalizado, agrégalo en `main.ts`

### Frontend no conecta con backend
- Verifica que `VITE_API_URL` esté configurado en Vercel
- Verifica que la URL del backend sea correcta
- Revisa la consola del navegador para ver qué URL está usando

---

## ✅ Checklist Final

- [ ] Base de datos creada en Supabase
- [ ] Variables de entorno configuradas en Fly.io
- [ ] Backend reiniciado en Fly.io
- [ ] Frontend desplegado en Vercel
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Frontend accesible y funcionando
- [ ] Login funciona correctamente
- [ ] Datos se guardan en la base de datos de Supabase

