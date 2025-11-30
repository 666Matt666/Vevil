# 📚 Documentación de la API - Vevil System

Esta documentación describe todos los endpoints disponibles en la API de Vevil System.

> **Nota**: Para documentación interactiva, accede a Swagger UI cuando el servidor esté corriendo:
> - Local: `http://localhost:3000/api/docs`
> - Producción: `https://vevil-dtt7ta.fly.dev/api/docs`

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluye el token en el header:

```
Authorization: Bearer <tu_token_jwt>
```

### Endpoints de Autenticación

#### `POST /api/auth/login`

Inicia sesión con email y contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "user"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas

---

#### `POST /api/auth/register`

Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `409 Conflict`: El email ya existe

---

#### `GET /api/auth/profile`

Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado

---

#### `POST /api/auth/logout`

Cierra la sesión del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

#### `POST /api/auth/refresh`

Refresca los tokens de autenticación.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📦 Productos

Todos los endpoints de productos requieren autenticación.

### `GET /api/products`

Obtiene la lista de todos los productos.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Nafta Super",
    "type": "combustible",
    "price": 850.50,
    "stock": 1000,
    "description": "Nafta de alto octanaje"
  },
  {
    "id": 2,
    "name": "Gasoil",
    "type": "combustible",
    "price": 750.00,
    "stock": 2000,
    "description": "Gasoil para vehículos"
  }
]
```

---

### `GET /api/products/:id`

Obtiene un producto específico por su ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nafta Super",
  "type": "combustible",
  "price": 850.50,
  "stock": 1000,
  "description": "Nafta de alto octanaje"
}
```

**Errores:**
- `404 Not Found`: Producto no encontrado

---

### `POST /api/products`

Crea un nuevo producto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Nafta Super",
  "type": "combustible",
  "price": 850.50,
  "stock": 1000,
  "description": "Nafta de alto octanaje"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Nafta Super",
  "type": "combustible",
  "price": 850.50,
  "stock": 1000,
  "description": "Nafta de alto octanaje",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Validaciones:**
- `name`: Requerido, string
- `type`: Requerido, string
- `price`: Requerido, número positivo
- `stock`: Requerido, número entero no negativo
- `description`: Opcional, string

---

### `PATCH /api/products/:id`

Actualiza un producto existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "price": 900.00,
  "stock": 1500
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nafta Super",
  "type": "combustible",
  "price": 900.00,
  "stock": 1500,
  "description": "Nafta de alto octanaje"
}
```

**Errores:**
- `404 Not Found`: Producto no encontrado

---

### `DELETE /api/products/:id`

Elimina un producto.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Producto eliminado exitosamente"
}
```

**Errores:**
- `404 Not Found`: Producto no encontrado
- `409 Conflict`: El producto está siendo usado en facturas

---

## 👥 Clientes

Todos los endpoints de clientes requieren autenticación.

### `GET /api/customers`

Obtiene la lista de todos los clientes.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Transporte ABC S.A.",
    "email": "contacto@transporte.com",
    "phones": [
      {
        "type": "mobile",
        "number": "+595981234567"
      }
    ],
    "address_street": "Av. Principal 123",
    "address_city": "Asunción",
    "address_province": "Asunción",
    "address_zip": "1000",
    "tax_id": "80012345-1"
  }
]
```

---

### `GET /api/customers/:id`

Obtiene un cliente específico por su ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Transporte ABC S.A.",
  "email": "contacto@transporte.com",
  "phones": [
    {
      "type": "mobile",
      "number": "+595981234567"
    }
  ],
  "address_street": "Av. Principal 123",
  "address_city": "Asunción",
  "address_province": "Asunción",
  "address_zip": "1000",
  "tax_id": "80012345-1"
}
```

---

### `POST /api/customers`

Crea un nuevo cliente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Transporte ABC S.A.",
  "email": "contacto@transporte.com",
  "phones": [
    {
      "type": "mobile",
      "number": "+595981234567"
    }
  ],
  "address_street": "Av. Principal 123",
  "address_city": "Asunción",
  "address_province": "Asunción",
  "address_zip": "1000",
  "tax_id": "80012345-1"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Transporte ABC S.A.",
  "email": "contacto@transporte.com",
  "phones": [...],
  "address_street": "Av. Principal 123",
  "address_city": "Asunción",
  "address_province": "Asunción",
  "address_zip": "1000",
  "tax_id": "80012345-1",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Validaciones:**
- `name`: Requerido, string
- `email`: Requerido, formato email válido
- `phones`: Opcional, array de objetos con `type` y `number`
- `address_*`: Opcional, strings
- `tax_id`: Opcional, string

---

### `PATCH /api/customers/:id`

Actualiza un cliente existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "nuevo@transporte.com",
  "address_city": "Ciudad del Este"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Transporte ABC S.A.",
  "email": "nuevo@transporte.com",
  ...
}
```

---

### `DELETE /api/customers/:id`

Elimina un cliente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Cliente eliminado exitosamente"
}
```

**Errores:**
- `404 Not Found`: Cliente no encontrado
- `409 Conflict`: El cliente tiene facturas asociadas

---

## 📄 Facturas

Todos los endpoints de facturas requieren autenticación.

### `GET /api/invoices`

Obtiene la lista de todas las facturas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "customer": {
      "id": 1,
      "name": "Transporte ABC S.A.",
      "email": "contacto@transporte.com"
    },
    "customerId": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "total": 2550.00,
    "items": [
      {
        "id": 1,
        "productId": 1,
        "product": {
          "id": 1,
          "name": "Nafta Super",
          "price": 850.50
        },
        "quantity": 3,
        "priceAtSale": 850.50
      }
    ]
  }
]
```

---

### `GET /api/invoices/:id`

Obtiene una factura específica por su ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "name": "Transporte ABC S.A.",
    "email": "contacto@transporte.com"
  },
  "customerId": 1,
  "date": "2024-01-15T00:00:00.000Z",
  "total": 2550.00,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "name": "Nafta Super",
        "price": 850.50
      },
      "quantity": 3,
      "priceAtSale": 850.50
    }
  ]
}
```

---

### `POST /api/invoices`

Crea una nueva factura.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 3
    },
    {
      "productId": 2,
      "quantity": 2
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "name": "Transporte ABC S.A."
  },
  "customerId": 1,
  "date": "2024-01-15T00:00:00.000Z",
  "total": 2550.00,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "name": "Nafta Super",
        "price": 850.50
      },
      "quantity": 3,
      "priceAtSale": 850.50
    }
  ]
}
```

**Validaciones:**
- `customerId`: Requerido, número entero, debe existir
- `items`: Requerido, array no vacío
  - `productId`: Requerido, número entero, debe existir
  - `quantity`: Requerido, número entero positivo
- El stock del producto debe ser suficiente

**Errores:**
- `400 Bad Request`: Validación fallida
- `404 Not Found`: Cliente o producto no encontrado
- `409 Conflict`: Stock insuficiente

**Nota**: Al crear una factura, el stock de los productos se reduce automáticamente.

---

## 🔒 Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Solicitud inválida
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: No tiene permisos
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email duplicado, stock insuficiente)
- `500 Internal Server Error`: Error del servidor

---

## 📝 Notas Adicionales

### Paginación

Algunos endpoints pueden soportar paginación en el futuro. Por ahora, todos los endpoints `GET` retornan todos los registros.

### Filtros y Búsqueda

Los filtros y búsqueda pueden ser agregados en futuras versiones.

### Rate Limiting

Actualmente no hay rate limiting implementado. Se recomienda implementarlo en producción.

---

## 🧪 Ejemplos de Uso

### Ejemplo Completo: Crear Factura

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'

# Respuesta: { "access_token": "eyJ..." }

# 2. Crear Factura
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 3
      }
    ]
  }'
```

---

Para más información, consulta la documentación interactiva en Swagger UI.

