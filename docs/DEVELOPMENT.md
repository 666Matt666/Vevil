# 👨‍💻 Guía de Desarrollo - Vevil System

Esta guía está dirigida a desarrolladores que quieren contribuir o trabajar en el proyecto.

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **PostgreSQL** 15 (o Docker)
- **Git**
- **Editor de código** (VS Code recomendado)

### Extensiones Recomendadas (VS Code)

- ESLint
- Prettier
- TypeScript
- Docker
- GitLens

### Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd vevil-system

# 2. Instalar dependencias del backend
cd backend-vevil
npm install

# 3. Instalar dependencias del frontend
cd ../frontend-vevil
npm install

# 4. Configurar variables de entorno
# Ver sección de Configuración más abajo
```

## ⚙️ Configuración de Variables de Entorno

### Backend

Crea `backend-vevil/.env`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=vevil_db

# JWT
JWT_SECRET=desarrollo_secreto_local_cambiar_en_produccion
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=desarrollo_refresh_secreto
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGINS=http://localhost:5173

# Puerto
PORT=3000
```

### Frontend

Crea `frontend-vevil/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Ejecutar en Desarrollo

### Backend

```bash
cd backend-vevil
npm run start:dev
```

El servidor estará en `http://localhost:3000`
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

### Frontend

```bash
cd frontend-vevil
npm run dev
```

El frontend estará en `http://localhost:5173`

## 📁 Estructura del Código

### Backend (NestJS)

```
backend-vevil/src/
├── [module]/              # Cada módulo tiene esta estructura
│   ├── [module].module.ts    # Definición del módulo
│   ├── [module].controller.ts # Endpoints REST
│   ├── [module].service.ts    # Lógica de negocio
│   ├── [entity].entity.ts      # Entidad TypeORM
│   └── dto/                    # Data Transfer Objects
│       ├── create-[entity].dto.ts
│       └── update-[entity].dto.ts
```

### Frontend (React)

```
frontend-vevil/src/
├── components/            # Componentes React
│   └── [feature]/         # Componentes por funcionalidad
│       ├── [Component].tsx
│       └── [Component].css
├── services/              # Servicios API
│   └── api.ts            # Cliente HTTP centralizado
├── router/               # Configuración de rutas
└── utils/                # Utilidades
```

## 🧪 Testing

### Backend

```bash
cd backend-vevil

# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Test específico
npm run test -- products.service.spec.ts
```

### Frontend

```bash
cd frontend-vevil

# Linting
npm run lint

# Formateo
npm run format
```

## 📝 Convenciones de Código

### Naming Conventions

- **Archivos**: `kebab-case.ts` (ej: `create-product.dto.ts`)
- **Clases**: `PascalCase` (ej: `ProductsService`)
- **Funciones/Variables**: `camelCase` (ej: `getAllProducts`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_RETRIES`)

### Estructura de Commits

Usa mensajes descriptivos:

```
feat: agregar filtro de búsqueda en productos
fix: corregir cálculo de total en facturas
docs: actualizar documentación de API
refactor: simplificar lógica de autenticación
test: agregar tests para módulo de clientes
```

### TypeScript

- Usa tipos explícitos cuando sea necesario
- Evita `any` cuando sea posible
- Usa interfaces para objetos
- Usa tipos para uniones y primitivos

```typescript
// ✅ Bueno
interface Product {
  id: number;
  name: string;
  price: number;
}

// ❌ Evitar
const product: any = { ... };
```

### React

- Usa componentes funcionales con hooks
- Extrae lógica compleja a custom hooks
- Usa TypeScript para props

```typescript
// ✅ Bueno
interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onSelect }) => {
  // ...
};
```

## 🔧 Herramientas de Desarrollo

### Base de Datos

#### Ver datos en PostgreSQL

```bash
# Conectar a la base de datos
psql -h localhost -U postgres -d vevil_db

# Comandos útiles
\dt              # Listar tablas
\d products      # Ver estructura de tabla
SELECT * FROM products;  # Ver datos
```

#### Seed de Datos

```bash
cd backend-vevil

# Seed de datos de ejemplo
npm run seed:examples

# Seed de datos de producción
npm run seed:production
```

### Debugging

#### Backend (VS Code)

Crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:dev"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### Frontend (Chrome DevTools)

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Sources"
3. Coloca breakpoints en el código
4. Recarga la página

## 🐛 Debugging Común

### Backend no inicia

1. Verifica que PostgreSQL esté corriendo
2. Verifica las variables de entorno
3. Revisa los logs de error
4. Verifica que el puerto 3000 esté libre

### Frontend no conecta al backend

1. Verifica que el backend esté corriendo
2. Verifica `VITE_API_URL` en `.env.local`
3. Revisa la consola del navegador (F12)
4. Verifica CORS en el backend

### Errores de base de datos

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos exista
4. Revisa los logs del backend

## 📦 Build y Producción

### Backend

```bash
cd backend-vevil

# Build
npm run build

# Ejecutar en producción
npm run start:prod
```

### Frontend

```bash
cd frontend-vevil

# Build
npm run build

# Preview del build
npm run preview
```

## 🔄 Git Workflow

### Ramas

- `main`: Código de producción
- `develop`: Código de desarrollo
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs
- `docs/*`: Documentación

### Proceso

1. Crea una rama desde `develop`
2. Desarrolla tu feature
3. Haz commit con mensajes descriptivos
4. Push a tu rama
5. Abre un Pull Request
6. Espera revisión y merge

## 📚 Recursos Adicionales

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Herramientas

- [Postman](https://www.postman.com/) - Para probar la API
- [DBeaver](https://dbeaver.io/) - Cliente de base de datos
- [VS Code](https://code.visualstudio.com/) - Editor recomendado

## ❓ Preguntas Frecuentes

### ¿Cómo agrego un nuevo módulo?

1. Genera el módulo con NestJS CLI:
   ```bash
   nest g module nombre-modulo
   nest g controller nombre-modulo
   nest g service nombre-modulo
   ```

2. Crea la entidad TypeORM
3. Crea los DTOs
4. Implementa la lógica en el servicio
5. Expone endpoints en el controlador

### ¿Cómo agrego un nuevo componente en React?

1. Crea el componente en `src/components/`
2. Agrega el servicio API si es necesario
3. Agrega la ruta en `src/router/index.ts`
4. Agrega el link en el menú si aplica

### ¿Cómo agrego validación a un DTO?

Usa decoradores de `class-validator`:

```typescript
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
```

---

**¡Feliz desarrollo! 🚀**

