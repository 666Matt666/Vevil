# 📚 Documentación de Vevil System

Bienvenido a la documentación completa del sistema Vevil. Esta carpeta contiene toda la documentación técnica y de referencia del proyecto.

## 📖 Índice de Documentación

### Documentación Principal

- **[README.md](../README.md)** - Documentación principal del proyecto
  - Descripción general
  - Instalación y configuración
  - Guía de uso básico
  - Estructura del proyecto

### Documentación Técnica

- **[API.md](./API.md)** - Documentación completa de la API REST
  - Todos los endpoints disponibles
  - Ejemplos de requests y responses
  - Códigos de estado HTTP
  - Autenticación y autorización

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura del sistema
  - Diseño de la arquitectura
  - Patrones de diseño utilizados
  - Flujo de datos
  - Modelo de base de datos
  - Seguridad y escalabilidad

### Guías de Despliegue

- **[../DEPLOY.md](../DEPLOY.md)** - Guía completa de despliegue
  - Configuración de Supabase
  - Despliegue en Fly.io
  - Despliegue en Vercel
  - Variables de entorno

- **[../CHECKLIST-DEPLOY.md](../CHECKLIST-DEPLOY.md)** - Checklist de despliegue
  - Pasos detallados
  - Verificaciones necesarias
  - Troubleshooting

- **[../ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md)** - Estado actual del despliegue
  - Verificación de componentes
  - URLs de producción
  - Comandos útiles

- **[../GUIA-CREDENCIALES-SUPABASE.md](../GUIA-CREDENCIALES-SUPABASE.md)** - Guía de credenciales
  - Cómo obtener credenciales de Supabase
  - Dónde encontrarlas
  - Cómo usarlas

### Guías de Verificación

- **[../VERIFICAR-ESTADO.md](../VERIFICAR-ESTADO.md)** - Cómo verificar el estado
  - Comandos de verificación
  - Checklist de componentes
  - Pruebas de conectividad

## 🚀 Inicio Rápido

### Para Desarrolladores

1. Lee el [README.md](../README.md) para entender el proyecto
2. Revisa [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la arquitectura
3. Consulta [API.md](./API.md) para usar la API

### Para Desplegar

1. Sigue [DEPLOY.md](../DEPLOY.md) para el despliegue inicial
2. Usa [CHECKLIST-DEPLOY.md](../CHECKLIST-DEPLOY.md) como referencia
3. Verifica con [VERIFICAR-ESTADO.md](../VERIFICAR-ESTADO.md)

### Para Usar la API

1. Consulta [API.md](./API.md) para todos los endpoints
2. Usa Swagger UI en `/api/docs` para documentación interactiva
3. Revisa los ejemplos de código en [API.md](./API.md)

## 📝 Convenciones de Documentación

### Comentarios en el Código

El código está documentado usando:

- **JSDoc** para funciones y clases TypeScript/JavaScript
- **Swagger/OpenAPI** para endpoints de la API
- **Comentarios inline** para lógica compleja

### Ejemplo de Documentación JSDoc

```typescript
/**
 * Crea un nuevo producto en el sistema
 * 
 * @param createProductDto - Datos del producto a crear
 * @returns Promise<Product> - El producto creado con su ID
 * @throws {ConflictException} Si el producto ya existe
 * @throws {BadRequestException} Si los datos son inválidos
 * 
 * @example
 * ```typescript
 * const product = await productsService.create({
 *   name: "Nafta Super",
 *   price: 850.50,
 *   stock: 1000
 * });
 * ```
 */
async create(createProductDto: CreateProductDto): Promise<Product> {
  // ...
}
```

## 🔍 Búsqueda de Información

### ¿Cómo hago X?

- **Instalar el proyecto**: [README.md](../README.md#instalación)
- **Desplegar en producción**: [DEPLOY.md](../DEPLOY.md)
- **Usar un endpoint**: [API.md](./API.md)
- **Entender la arquitectura**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Configurar base de datos**: [GUIA-CREDENCIALES-SUPABASE.md](../GUIA-CREDENCIALES-SUPABASE.md)

### Problemas Comunes

- **Backend no responde**: [ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md#backend-flyio)
- **Frontend no conecta**: [ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md#frontend-vercel)
- **Base de datos no conecta**: [ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md#base-de-datos-supabase)
- **Errores de CORS**: [DEPLOY.md](../DEPLOY.md#problemas-comunes)

## 📞 Soporte

Si necesitas ayuda adicional:

1. Revisa la documentación relevante arriba
2. Consulta los logs del servidor
3. Abre un issue en el repositorio
4. Contacta al equipo de desarrollo

## 🔄 Actualización de Documentación

Esta documentación se actualiza junto con el código. Si encuentras información desactualizada:

1. Abre un issue reportando el problema
2. O crea un Pull Request con la corrección

---

**Última actualización**: 2024

