# Guía de Despliegue - Vevil System

## Estructura de Ambientes

### Producción (PROD)
- **App en Fly.io**: `vevil-dtt7ta`
- **Rama**: `main`
- **URL**: https://vevil-dtt7ta.fly.dev
- **Configuración**: `fly.toml`

### Desarrollo (DESA)
- **App en Fly.io**: `vevil-dev`
- **Rama**: `develop`
- **URL**: https://vevil-dev.fly.dev
- **Configuración**: `fly.dev.toml`

## Flujo de Trabajo

### 1. Desarrollo Local
```bash
# Crear rama de desarrollo (solo la primera vez)
git checkout -b develop

# Trabajar en tu rama de desarrollo
git add .
git commit -m "mi cambio"
git push origin develop
```

### 2. Despliegue Automático
El sistema de CI/CD despliega automáticamente:

- **Push a `develop`** → Despliega a `vevil-dev` (ambiente de desarrollo)
- **Push a `main`** → Despliega a `vevil-dtt7ta` (ambiente de producción)

### 3. Promoción a Producción
Cuando todo esté probado en desarrollo:

```bash
# Crear Pull Request de develop a main
# Revisar cambios en GitHub
# Aprobar y mergear el PR
# El despliegue a producción se ejecutará automáticamente
```

## Comandos Útiles

### Verificar estado de los ambientes
```bash
# Producción
flyctl status -a vevil-dtt7ta

# Desarrollo
flyctl status -a vevil-dev
```

### Ver logs
```bash
# Producción
flyctl logs -a vevil-dtt7ta

# Desarrollo
flyctl logs -a vevil-dev
```

### Despliegue manual (si es necesario)
```bash
# Producción
flyctl deploy --config fly.toml

# Desarrollo
flyctl deploy --config fly.dev.toml
```

## Variables de Entorno

### Opción 1: Copiar automáticamente de producción a desarrollo

Usa los scripts incluidos para copiar todas las variables de producción a desarrollo:

**Windows:**
```bash
vevil-system\copy-secrets-to-dev.bat
```

**Linux/Mac:**
```bash
./vevil-system/copy-secrets-to-dev.sh
```

### Opción 2: Configurar manualmente

```bash
# Configurar variables en Fly.io
flyctl secrets set VARIABLE_NAME=value -a vevil-dev
flyctl secrets set VARIABLE_NAME=value -a vevil-dtt7ta
```

### Verificar variables configuradas

```bash
# Ver variables de producción
flyctl secrets list -a vevil-dtt7ta

# Ver variables de desarrollo
flyctl secrets list -a vevil-dev
```

## Base de Datos

Cada ambiente tiene su propia base de datos:
- **Producción**: Base de datos de producción
- **Desarrollo**: Base de datos de desarrollo

**Importante**: No compartas datos entre ambientes para evitar problemas.

## Solución de Problemas

### El despliegue falla
1. Verifica que los tests pasen localmente
2. Revisa los logs en GitHub Actions
3. Verifica que las variables de entorno estén configuradas

### No se puede acceder al ambiente de desarrollo
1. Verifica que la app esté corriendo: `flyctl status -a vevil-dev`
2. Revisa los logs: `flyctl logs -a vevil-dev`
3. Si es necesario, reinicia la app: `flyctl apps restart vevil-dev`
