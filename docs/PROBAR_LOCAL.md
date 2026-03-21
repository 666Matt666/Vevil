# Probar todo lo nuevo en local

Pasos para levantar backend + frontend y probar las funcionalidades recientes.

## 1. Base de datos

Asegurate de tener **PostgreSQL** corriendo (puerto 5432).

Con Docker (desde la raíz de `vevil-system`):

```bash
docker-compose up -d
```

Creá la base si no existe:

```sql
CREATE DATABASE vevil_db;
```

## 2. Backend

```bash
cd vevil-system/backend-vevil
npm install
```

Si no tenés `.env`, copiá el ejemplo y ajustá:

```bash
copy .env.local.example .env
# (o en Linux/Mac: cp .env.local.example .env)
```

Contenido mínimo de `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=vevil_db
JWT_SECRET=desarrollo_secreto_local
JWT_REFRESH_SECRET=desarrollo_refresh_secreto
CORS_ORIGINS=http://localhost:5173
PORT=3000
```

Migraciones (si las usás):

```bash
npm run migration:run
```

Crear usuario admin (si no tenés):

```bash
npm run create:admin
```

Arrancar el backend:

```bash
npm run start:dev
```

Deberías ver algo como: `Nest application successfully started` y la API en **http://localhost:3000/api**.

## 3. Frontend

En **otra terminal**:

```bash
cd vevil-system/frontend-vevil
npm install
```

Si no tenés `.env.local`, crealo con:

```env
VITE_API_URL=http://localhost:3000/api
```

Arrancar el frontend:

```bash
npm run dev
```

Abrí **http://localhost:5173** en el navegador.

## 4. Qué probar

| Funcionalidad | Dónde | Cómo probar |
|---------------|--------|--------------|
| **Sesión expirada** | Login | Cerrar sesión o esperar vencimiento; deberías ir a `/login?expired=1` y ver "Sesión expirada. Volvé a iniciar sesión." |
| **Paginación** | Productos, Clientes, Facturas, Auditoría | Ver botones Anterior/Siguiente y números de página; cambiar de página. |
| **Filtros con paginación** | Productos | Buscar por nombre, filtrar por tipo/categoría; ver que los resultados y el total cambian. |
| **Filtros con paginación** | Clientes | Buscar por nombre/email, filtrar por departamento. |
| **Filtros con paginación** | Facturas | Buscar por N° o cliente, filtrar por estado, cliente, rango de fechas. |
| **Confirmación al eliminar** | Productos / Clientes | Clic en Eliminar → aparece modal "¿Eliminar...? No se puede deshacer." → Cancelar o Confirmar. |
| **Confirmación al anular factura** | Facturas | En el select de estado elegir "Anulada" → modal "¿Anular la factura...?" → Cancelar o Anular. |
| **Exportar auditoría** | Auditoría | Ir a Auditoría → botón "Exportar CSV" (arriba a la derecha) → se descarga un CSV. |
| **Accesibilidad** | Modales / Paginación | En el modal de confirmación: Tab para mover foco, Escape para cerrar. Botones con etiquetas para lectores de pantalla. |

## 5. Tests (opcional)

Unit tests (frontend):

```bash
cd vevil-system/frontend-vevil
npm run test
```

E2E (con backend y frontend ya corriendo en 3000 y 5173):

```bash
cd vevil-system/frontend-vevil
npx playwright test
```

O levantar todo automático para E2E:

```bash
cd vevil-system/frontend-vevil
npm run e2e:full:local
```

(Requiere Docker para Postgres y que los puertos 5173, 3000 y 3001 estén libres.)
