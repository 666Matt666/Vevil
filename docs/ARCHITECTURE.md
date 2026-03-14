# 🏗 Arquitectura del Sistema - Vevil System

Este documento describe en detalle la arquitectura del sistema Vevil.

## 📐 Visión General

Vevil System sigue una arquitectura de **tres capas** (3-tier architecture) con separación clara entre:

1. **Capa de Presentación** (Frontend)
2. **Capa de Lógica de Negocio** (Backend)
3. **Capa de Datos** (Base de Datos)

```
┌─────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN            │
│         (React + Vite)                  │
│         - Componentes UI                │
│         - Servicios API                 │
│         - Routing                       │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│      CAPA DE LÓGICA DE NEGOCIO          │
│      (NestJS)                           │
│      - Controladores                    │
│      - Servicios                        │
│      - DTOs y Validación                │
│      - Autenticación                    │
└─────────────────┬───────────────────────┘
                  │ SQL/TypeORM
┌─────────────────▼───────────────────────┐
│         CAPA DE DATOS                   │
│         (PostgreSQL)                    │
│         - Entidades                     │
│         - Relaciones                    │
│         - Índices                       │
└─────────────────────────────────────────┘
```

## 🔧 Backend - Arquitectura NestJS

### Estructura Modular

El backend está organizado en **módulos independientes**, cada uno con responsabilidades específicas:

```
backend-vevil/src/
├── app.module.ts          # Módulo raíz
├── auth/                  # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/        # Estrategias Passport
│   ├── guards/            # Guards de autenticación
│   └── decorators/        # Decoradores personalizados
├── users/                 # Módulo de usuarios
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── user.entity.ts
│   └── dto/
├── products/              # Módulo de productos
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── product.entity.ts
│   └── dto/
├── customers/             # Módulo de clientes
│   ├── customers.module.ts
│   ├── customers.controller.ts
│   ├── customers.service.ts
│   ├── customer.entity.ts
│   └── dto/
└── invoices/               # Módulo de facturas
    ├── invoices.module.ts
    ├── invoices.controller.ts
    ├── invoices.service.ts
    ├── invoice.entity.ts
    ├── invoice-item.entity.ts
    └── dto/
```

### Patrón de Diseño

#### 1. **MVC (Model-View-Controller)**

- **Model**: Entidades TypeORM (`*.entity.ts`)
- **View**: Respuestas JSON (no hay vistas HTML)
- **Controller**: Controladores NestJS (`*.controller.ts`)

#### 2. **Service Layer Pattern**

La lógica de negocio está separada en servicios (`*.service.ts`):

```typescript
// Ejemplo: ProductsService
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Lógica de negocio aquí
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }
}
```

#### 3. **DTO Pattern**

Los DTOs (Data Transfer Objects) se usan para:
- Validación de entrada
- Transformación de datos
- Documentación (Swagger)

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
```

### Flujo de una Petición

```
1. Cliente (Frontend)
   ↓ HTTP Request
2. Controller (auth.controller.ts)
   ↓ Valida DTO
3. Guard (JwtAuthGuard)
   ↓ Verifica token
4. Service (products.service.ts)
   ↓ Lógica de negocio
5. Repository (TypeORM)
   ↓ Query SQL
6. Base de Datos (PostgreSQL)
   ↓
7. Response JSON
   ↓
8. Cliente (Frontend)
```

### Autenticación y Autorización

#### Estrategia de Autenticación

- **JWT (JSON Web Tokens)**: Para autenticación stateless
- **Passport.js**: Middleware de autenticación
- **Refresh Tokens**: Para renovar tokens sin re-login

#### Guards

```typescript
@UseGuards(AuthGuard('jwt'))
@Get('profile')
getProfile(@GetUser() user: User) {
  return user;
}
```

#### Decoradores Personalizados

- `@Public()`: Marca endpoints públicos
- `@GetUser()`: Extrae el usuario del token JWT
- `@Roles()`: Control de roles (si se implementa)

## 🎨 Frontend - Arquitectura React

### Estructura de Componentes

```
frontend-vevil/src/
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── products/         # Componentes de productos
│   ├── customers/        # Componentes de clientes
│   ├── invoices/          # Componentes de facturas
│   ├── dashboard/         # Dashboard
│   ├── layout/            # Layout principal
│   └── reports/           # Reportes
├── services/              # Servicios API
│   └── api.ts            # Cliente HTTP centralizado
├── router/                # Configuración de rutas
│   └── index.ts
├── stores/                # Estado global (si se usa)
└── utils/                 # Utilidades
```

### Patrones de Diseño

#### 1. **Component-Based Architecture**

Cada funcionalidad está encapsulada en componentes:

```typescript
// ProductList.tsx
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  return (
    <div>
      {/* UI del componente */}
    </div>
  );
};
```

#### 2. **Service Layer Pattern**

Los servicios encapsulan la comunicación con la API:

```typescript
// services/api.ts
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetchWithAuth('/products');
    return response.json();
  },
  create: async (product: CreateProductDto): Promise<Product> => {
    const response = await fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.json();
  },
};
```

#### 3. **Routing con React Router**

```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<Layout />}>
    <Route path="products" element={<ProductList />} />
    <Route path="customers" element={<CustomerList />} />
  </Route>
</Routes>
```

### Gestión de Estado

Actualmente se usa **estado local con React Hooks**:

- `useState`: Estado local del componente
- `useEffect`: Efectos secundarios (cargar datos)
- `useContext`: (Si se implementa) Estado global

### Comunicación con el Backend

```typescript
// Detección automática de URL del backend
const getApiBaseUrl = (): string => {
  // 1. Verifica variable de entorno
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Si está en Vercel, usa backend de producción (Render)
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://evil-backend.onrender.com/api';
  }
  
  // 3. Fallback a localhost
  return 'http://localhost:3000/api';
};
```

## 🗄️ Base de Datos - Modelo de Datos

### Entidades Principales

```
┌─────────────┐
│    User     │
│─────────────│
│ id          │
│ name        │
│ email       │
│ password    │
│ role        │
└─────────────┘

┌─────────────┐
│  Product    │
│─────────────│
│ id          │
│ name        │
│ type        │
│ price       │
│ stock       │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│  InvoiceItem   │
│────────────────│
│ id             │
│ invoiceId      │
│ productId      │
│ quantity       │
│ priceAtSale    │
└──────┬──────────┘
       │
       │ N:1
       │
┌──────▼──────────┐
│   Invoice       │
│────────────────│
│ id             │
│ customerId     │
│ date           │
│ total          │
└──────┬──────────┘
       │
       │ N:1
       │
┌──────▼──────────┐
│   Customer      │
│────────────────│
│ id             │
│ name           │
│ email          │
│ phones         │
│ address_*      │
│ tax_id         │
└────────────────┘
```

### Relaciones

- **User** → No tiene relaciones directas con otras entidades
- **Product** → 1:N con **InvoiceItem**
- **Customer** → 1:N con **Invoice**
- **Invoice** → 1:N con **InvoiceItem**
- **InvoiceItem** → N:1 con **Invoice** y **Product**

### Índices

Los índices se crean automáticamente en:
- Claves primarias (`id`)
- Claves foráneas (`customerId`, `productId`, `invoiceId`)
- Campos de búsqueda frecuente (`email` en User y Customer)

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear una Factura

```
1. Usuario hace click en "Crear Factura"
   ↓
2. Frontend: InvoiceList.tsx
   ↓
3. Usuario selecciona cliente y productos
   ↓
4. Frontend: productsApi.create()
   ↓
5. HTTP POST /api/invoices
   ↓
6. Backend: InvoicesController.create()
   ↓
7. Backend: Valida CreateInvoiceDto
   ↓
8. Backend: InvoicesService.create()
   ↓
9. Backend: Verifica stock disponible
   ↓
10. Backend: Crea Invoice y InvoiceItems (transacción)
    ↓
11. Backend: Actualiza stock de productos
    ↓
12. Backend: Retorna Invoice completa
    ↓
13. Frontend: Actualiza UI con nueva factura
```

## 🛡️ Seguridad

### Autenticación

- **JWT Tokens**: Stateless, seguro
- **Refresh Tokens**: Renovación sin re-login
- **Password Hashing**: bcrypt con salt rounds

### Autorización

- **Guards**: Protección de rutas
- **Roles**: (Futuro) Control de acceso por roles

### Validación

- **DTOs**: Validación de entrada
- **class-validator**: Validaciones automáticas
- **Sanitización**: Prevención de inyección

### CORS

Configurado para permitir solo orígenes específicos:
- `localhost:5173` (desarrollo)
- `*.vercel.app` (producción)

## 📦 Despliegue

### Arquitectura de Despliegue

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
│   CDN Global     │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│   Render        │
│   (Backend)     │
│   App Server    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼──────┐
│  API  │ │  Auth    │
│  REST │ │  JWT     │
└───┬───┘ └───┬──────┘
    │         │
┌───▼─────────▼───┐
│   Supabase      │
│   PostgreSQL    │
│   Managed DB    │
└─────────────────┘
```

### Variables de Entorno

**Backend (Render):**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`

**Frontend (Vercel):**
- `VITE_API_URL`

## 🚀 Escalabilidad

### Backend

- **Stateless**: Cada request es independiente
- **Horizontal Scaling**: Múltiples instancias posibles
- **Database Connection Pooling**: TypeORM maneja conexiones

### Frontend

- **CDN**: Vercel distribuye contenido globalmente
- **Code Splitting**: Vite optimiza bundles
- **Caching**: Headers de cache configurados

### Base de Datos

- **Índices**: Optimización de queries
- **Relaciones**: Normalización de datos
- **Transacciones**: Consistencia de datos

## 📊 Monitoreo y Logs

### Logs del Backend

- Console logs en desarrollo
- Logs estructurados en producción (Render)

### Métricas

- Tiempo de respuesta de API
- Errores y excepciones
- Uso de recursos

---

Esta arquitectura está diseñada para ser:
- ✅ **Modular**: Fácil de mantener y extender
- ✅ **Escalable**: Preparada para crecimiento
- ✅ **Segura**: Autenticación y validación robustas
- ✅ **Mantenible**: Código organizado y documentado











