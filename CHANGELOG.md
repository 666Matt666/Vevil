# Changelog

Todos los cambios notables en Vevil System serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [En Desarrollo] - 2025-04-17

### 🔥 Crítico
- **Seguridad**: Implementado `AllExceptionsFilter` completo (archivo estaba vacío)
- **Seguridad**: CORS cambiado a whitelist explícita (orígenes específicos) - ya no se permite cualquier origen
- **Seguridad**: Agregado middleware de security headers (CSP, HSTS, X-Frame-Options, X-XSS-Protection)
- **Documentación**: Anotaciones Swagger agregadas a ProductsController y CustomersController
- **Documentación**: Anotaciones Swagger agregadas a InvoicesController

### 🛠 Mejoras
- **Código**: Reemplazado `console.log`/`console.error` por NestJS Logger en `main.ts`
- **Testing**: Agregado test de integración completo para facturación (`invoicing.integration.spec.ts`)
  - Crea factura y verifica transacción (stock disminuye)
  - Verifica rollback si stock insuficiente
  - Prueba edición de factura pagada (debe fallar)
  - Prueba eliminación con pagos asociados (debe fallar)
  - Prueba eliminación de factura pendiente sin pagos
- **Calidad**: Configurado ESLint en backend (`.eslintrc.js`, `.eslintignore`)
- **Calidad**: Configurado ESLint en frontend (`.eslintrc.cjs`, `.eslintignore`)
  - Instalados plugins: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-import`, `eslint-config-prettier`
  - Ajustada regla `import/order` con opciones correctas (`newlines-between` kebab-case)
- **Calidad**: Agregados scripts `lint`, `lint:backend`, `lint:frontend` en package.json raíz
- **Arquitectura**: Creado `PaginatedResponseDto` genérico en `common/dto/`

### 🐛 Correcciones
- **TypeScript**: Eliminado uso de `any` en middleware de request logging

### ⚠ Breaking Changes
Ninguno (cambios backwards-compatible)

### 🔄 Migración
No se requiere migración de base de datos.

### 📝 Notas
- Asegúrate de instalar dependencias de ESLint después de clonar:
  ```bash
  cd backend-vevil && npm install
  cd frontend-vevil && npm install
  ```
- Para ejecutar linters:
  ```bash
  npm run lint:backend
  npm run lint:frontend
  ```
- Tests de integración requieren SQLite en memoria (ya configurado) y se ejecutan con:
  ```bash
  npm run test --prefix backend-vevil -- invoicing.integration.spec.ts
  ```

---

## [0.1.0] - 2025-03-15

### 🎉 Funcionalidades Iniciales
- Backend NestJS con autenticación JWT + WebAuthn
- Frontend React + Vite con TailwindCSS
- Módulos: Users, Products, Customers, Invoices, Audit, Backup, Mail
- API REST文档 con Swagger
- PostgreSQL local + Supabase en producción
- Docker Compose para desarrollo
- Despliegue automático en Render (backend) y Vercel (frontend)
