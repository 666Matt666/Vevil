# 🔍 Verificación del Estado del Despliegue

## Instrucciones para Verificar

Ejecuta estos comandos en tu terminal para verificar cada componente:

### 1️⃣ Backend (Fly.io)

```bash
# Verificar que el backend responda
curl https://vevil-dtt7ta.fly.dev/api

# Verificar la documentación de la API
curl https://vevil-dtt7ta.fly.dev/api/docs
```

**Resultado esperado:**
- ✅ Si responde con código 200 o 404: Backend está funcionando
- ❌ Si no responde o da timeout: Backend no está disponible

### 2️⃣ Frontend (Vercel)

**Opción A: Verificar en el navegador**
1. Abre tu navegador
2. Ve a tu dashboard de Vercel: https://vercel.com
3. Busca tu proyecto
4. Copia la URL de producción (ej: `https://vevil.vercel.app`)

**Opción B: Verificar con curl**
```bash
# Reemplaza TU-URL-VERCEL con tu URL real
curl https://TU-URL-VERCEL.vercel.app
```

**Resultado esperado:**
- ✅ Si responde con HTML: Frontend está desplegado
- ❌ Si da 404: Frontend no está desplegado o URL incorrecta

### 3️⃣ Base de Datos (Supabase)

**Verificar en Supabase:**
1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database**
4. Verifica que el proyecto esté activo

**Verificar desde el backend:**
```bash
# Verificar logs de Fly.io para errores de conexión
flyctl logs -a vevil-dtt7ta
```

**Resultado esperado:**
- ✅ Si no hay errores de conexión en los logs: Base de datos conectada
- ❌ Si hay errores "Connection refused" o "ECONNREFUSED": Problema de conexión

---

## Checklist de Verificación

### Backend (Fly.io)
- [ ] URL accesible: `https://vevil-dtt7ta.fly.dev/api`
- [ ] API Docs accesible: `https://vevil-dtt7ta.fly.dev/api/docs`
- [ ] Variables de entorno configuradas (DB_HOST, DB_PASSWORD, etc.)
- [ ] No hay errores en los logs

### Frontend (Vercel)
- [ ] Proyecto desplegado en Vercel
- [ ] URL de producción accesible (ej: `https://vevil.vercel.app`)
- [ ] Variable `VITE_API_URL` configurada
- [ ] Frontend se conecta al backend correctamente

### Base de Datos (Supabase)
- [ ] Proyecto creado en Supabase
- [ ] Variables de entorno configuradas en Fly.io:
  - [ ] DB_HOST
  - [ ] DB_PASSWORD
  - [ ] DB_USERNAME
  - [ ] DB_DATABASE
- [ ] No hay errores de conexión en los logs del backend

---

## Comandos Útiles

### Ver logs del backend en Fly.io
```bash
flyctl logs -a vevil-dtt7ta
```

### Ver variables de entorno en Fly.io
```bash
flyctl secrets list -a vevil-dtt7ta
```

### Verificar estado de la app en Fly.io
```bash
flyctl status -a vevil-dtt7ta
```

---

## Prueba Completa

1. **Abre el frontend en tu navegador**
2. **Abre la consola del navegador (F12)**
3. **Intenta hacer login**
4. **Verifica en la consola:**
   - Deberías ver: `✅ Using production backend: https://vevil-dtt7ta.fly.dev/api`
   - No debería haber errores de CORS
   - No debería haber errores de conexión

Si todo funciona: ✅ **¡Despliegue completo y funcionando!**

