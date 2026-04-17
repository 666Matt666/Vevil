# Changelog

Todos los cambios notables en Vevil System serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [En Desarrollo] - 2026-04-17

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

### 📚 Documentación
- **README.md**: Actualizado con badges de CI, tabla de entornos, comandos principales y enlaces a docs
- **docs/DEVELOPMENT.md**: Agregada sección "Troubleshooting" (tablas de problemas comunes + soluciones) y tabla comparativa de entornos
- **docs/E2E.md**: Enriquecido con descripción de flujos cubiertos, screenshots esperados y troubleshooting
- **docs/DEPLOY.md**: Agregado diagrama CI/CD (Mermaid) y sección rollback detallada + monitoreo post-deploy
- **docs/README.md**: Índice completo actualizado con CONTRIBUTING.md y SKILLS.md
- **CONTRIBUTING.md**: Guía nueva de contribución con PR template, convenciones de commits y code review

### 🚀 Features (Reportes)
- **Exportación Excel con formato**: Nuevo endpoint `GET /api/export/excel` genera archivo `.xlsx` con múltiples hojas (Products, Customers, Invoices, Audit Log) y estilos profesionales:
  - Header verde corporativo (#14532d) con texto blanco
  - Formato de moneda (`$1,234.56`), fechas regionalizadas (`dd/mm/yyyy`)
  - Auto-filtros y headers congelados en cada hoja
  - Ancho de columna automático
- **Frontend**: Botón "Exportar Excel" en vista Auditoría (junto a CSV existente)
- **Backend**: Servicio `ExcelExportService` con `exceljs`; exporta hasta 10,000 logs de auditoría

### 🐛 Correcciones
- **TypeScript**: Eliminado uso de `any` en middleware de request logging
- **Testing**: Corregidos tests de componentes UI (EmptyState, Pagination) con API actualizada
- **Testing**: Corregidos tests de componentes UI (EmptyState, Pagination) con API actualizada

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
