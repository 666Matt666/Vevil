# Guía de Despliegue Multi-Ambiente - Vevil System

## Arquitectura Actual

### Producción (PROD)
- **GitHub**: Repositorio principal
- **Render**: `vevil-backend` (backend)
- **Vercel**: `vevil.vercel.app` (frontend)
- **Supabase**: Base de datos PostgreSQL

### Desarrollo (DESA/TEST)
- **GitHub**: Mismo repositorio, rama `develop`
- **Render**: `vevil-backend-dev` (backend de desarrollo)
- **Vercel**: `vevil-dev.vercel.app` (frontend de desarrollo)
- **Supabase**: Proyecto separado para desarrollo

## Configuración de Ambientes

### 1. Supabase - Base de Datos de Desarrollo

1. Crear nuevo proyecto en Supabase:
   - Ir a https://supabase.com/dashboard
   - Click en "New Project"
   - Nombre: `vevil-dev`
   - Configurar base de datos

2. Obtener credenciales:
   - Ir a Settings → Database
   - Copiar:
     - Host: `aws-1-us-east-2.pooler.supabase.com` (o similar)
     - Database: `postgres`
     - Username: `postgres.xxxxxxxxxx`
     - Password: (generar nueva contraseña)

3. Ejecutar migraciones:
   ```bash
   # Configurar variables de entorno locales
   export DB_HOST=tu-host-dev
   export DB_USERNAME=tu-username-dev
   export DB_PASSWORD=tu-password-dev
   export DB_DATABASE=postgres
   
   # Ejecutar migraciones
   npm run migration:run:prod
   ```

### 2. Render - Backend de Desarrollo

1. Crear nuevo servicio en Render:
   - Ir a https://dashboard.render.com
   - Click en "New +" → "Web Service"
   - Conectar mismo repositorio de GitHub
   - Nombre: `vevil-backend-dev`
   - Branch: `develop`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

2. Configurar variables de entorno:
   ```
   DB_HOST=tu-host-dev-supabase
   DB_PORT=5432
   DB_USERNAME=tu-username-dev
   DB_PASSWORD=tu-password-dev
   DB_DATABASE=postgres
   JWT_SECRET=VevilJwtS3cr3tD3v_xxxxxxxxxx
   JWT_REFRESH_SECRET=VevilR3fr3shS3cr3tD3v_xxxxxxxxxx
   CORS_ORIGINS=https://vevil-dev.vercel.app
   ```

3. Configurar auto-deploy:
   - En Settings → Build & Deploy
   - Enable "Auto-Deploy"
   - Branch: `develop`

### 3. Vercel - Frontend de Desarrollo

1. Crear nuevo proyecto en Vercel:
   - Ir a https://vercel.com/dashboard
   - Click en "Add New..." → "Project"
   - Importar mismo repositorio de GitHub
   - Nombre: `vevil-dev`
   - Framework Preset: (seleccionar el framework del frontend)
   - Root Directory: (directorio del frontend si está en subcarpeta)

2. Configurar variables de entorno:
   ```
   VITE_API_URL=https://vevil-backend-dev.onrender.com/api
   ```
   (o la variable que use tu frontend para la URL del backend)

3. Configurar dominio:
   - En Settings → Domains
   - Agregar: `vevil-dev.vercel.app`

4. Configurar auto-deploy:
   - En Settings → Git
   - Production Branch: `develop`

## Flujo de Trabajo

### Desarrollo
```bash
# 1. Crear rama de desarrollo (primera vez)
git checkout -b develop

# 2. Trabajar en desarrollo
git add .
git commit -m "mi cambio"
git push origin develop

# 3. Los servicios se despliegan automáticamente:
#    - Render: vevil-backend-dev
#    - Vercel: vevil-dev.vercel.app
```

### Producción
```bash
# 1. Cuando todo esté probado en desarrollo
git checkout main
git merge develop
git push origin main

# 2. Los servicios se despliegan automáticamente:
#    - Render: vevil-backend
#    - Vercel: vvil.vercel.app
```

## URLs de los Ambientes

### Producción
- Frontend: https://vevil.vercel.app
- Backend: https://vevil-backend.onrender.com
- API: https://vevil-backend.onrender.com/api

### Desarrollo
- Frontend: https://vevil-dev.vercel.app
- Backend: https://vevil-backend-dev.onrender.com
- API: https://vevil-backend-dev.onrender.com/api

## Variables de Entorno por Ambiente

### Supabase Producción
```
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_USERNAME=postgres.tplcbrhlubahvuknwyjw
DB_PASSWORD=4SAg6zE68lgEaW86
```

### Supabase Desarrollo
```
DB_HOST=tu-host-dev-supabase
DB_USERNAME=tu-username-dev
DB_PASSWORD=tu-password-dev
```

### JWT Secrets (diferentes por ambiente)
```
# Producción
JWT_SECRET=VevilJwtS3cr3tPr0d_8xK2mN5pQ7rT9wY1zA4cE6gI0oL3nM5qS8uW
JWT_REFRESH_SECRET=VevilR3fr3shS3cr3t_2bD4fH6jL8nP0rT2vX4zA6cE8gI1kM3oQ5sU7wY

# Desarrollo
JWT_SECRET=VevilJwtS3cr3tD3v_xxxxxxxxxx
JWT_REFRESH_SECRET=VevilR3fr3shS3cr3tD3v_xxxxxxxxxx
```

### CORS Origins
```
# Producción
CORS_ORIGINS=https://vevil.vercel.app

# Desarrollo
CORS_ORIGINS=https://vevil-dev.vercel.app
```

## Scripts de Configuración

### Verificar estado de los servicios
```bash
# Verificar Render
curl https://vevil-backend.onrender.com/api/health
curl https://vevil-backend-dev.onrender.com/api/health

# Verificar Vercel
curl https://vevil.vercel.app
curl https://vevil-dev.vercel.app
```

### Ejecutar migraciones manualmente
```bash
# Producción
flyctl ssh console -a vevil-dtt7ta -C "npm run migration:run:prod"

# Desarrollo
flyctl ssh console -a vevil-dev -C "npm run migration:run:prod"
```

## Solución de Problemas

### El backend de desarrollo no conecta a la base de datos
1. Verificar variables de entorno en Render
2. Verificar que la base de datos de Supabase esté activa
3. Verificar credenciales correctas

### El frontend de desarrollo no conecta al backend
1. Verificar `VITE_API_URL` en Vercel
2. Verificar `CORS_ORIGINS` en Render
3. Verificar que el backend esté corriendo

### Los cambios no se despliegan automáticamente
1. Verificar que la rama correcta esté configurada en cada servicio
2. Verificar que "Auto-Deploy" esté habilitado
3. Revisar logs de despliegue en cada plataforma
