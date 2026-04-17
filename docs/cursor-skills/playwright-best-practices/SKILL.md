# Node.js Backend Patterns (Skill Completo)

Fuente: https://skills.sh/wshobson/agents/nodejs-backend-patterns
Repositorio: https://github.com/wshobson/agents

## Overview

Patrones de arquitectura y mejores prácticas para backends Node.js, incluyendo Express, Fastify, y frameworks como NestJS. Cubre middleware, autenticación, base de datos, API design, escalabilidad.

## 1. Architecture Patterns

### Layered Architecture
```
Controller Layer  →  Service Layer  →  Repository/DAO Layer  →  Database
      ↑                    ↑                     ↑
   HTTP/Route        Business Logic         Data Access
```

**Vevil example**:
```typescript
// Controller (backup.controller.ts)
@Post('enabled')
async setEnabled(@Body() body: { enabled: boolean }) {
  return this.backupService.setBackupEnabled(body.enabled);
}

// Service (backup.service.ts)
@Injectable()
export class BackupService {
  setBackupEnabled(enabled: boolean) {
    this.backupEnabled = enabled;
    this.logger.log(`Backup ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true, enabled: this.backupEnabled };
  }
}
```

### Service Pattern
Services encapsulate business logic. Should be:
- ** Injectable** (DI container manages lifecycle)
- **Single responsibility** (one entity/domain per service)
- **Stateless** where possible (except caches/configs)

### Repository Pattern
Abstracts data access. Benefits:
- Testability (mock repository)
- Database-agnostic (swap TypeORM for Prisma later)
- Centralized query logic

```typescript
// repository pattern example (future improvement)
@Injectable()
export class CustomerRepository {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}
  
  async findByEmail(email: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { email } });
  }
}
```

## 2. Middleware Patterns

### Error Handling Middleware
```typescript
// All exceptions filter (already in Vevil)
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : 500;
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

### Request Logging
```typescript
app.use((req: any, _res, next) => {
  const origin = req.headers?.origin ?? '(none)';
  console.log(`[Vevil] ${req.method} ${req.url} | Origin: ${origin}`);
  next();
});
```

### Authentication Middleware
```typescript
@UseGuards(AuthGuard('jwt'))
@Controller('backups')
export class BackupController { ... }
```

### Validation Pipes
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Strip unknown props
    forbidNonWhitelisted: true, // Error on unknown props
    transform: true,        // Auto-transform DTOs
  })
);
```

## 3. Authentication & Authorization

### JWT Best Practices
- Use `httpOnly` cookies (not localStorage) for XSS protection
- Short-lived access tokens (15-30 min)
- Long-lived refresh tokens (7 days) with rotation
- Store refresh tokens in DB (revocable)
- Use `SameSite=Strict` CSRF protection

**Vevil status**: Uses JWT + HttpOnly cookies ✅

### Rate Limiting
```typescript
// Apply to auth endpoints
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController { ... }

// In module
ThrottlerModule.forRoot([
  {
    ttl: 60 * 60, // 1 hour
    limit: 10,    // 10 attempts per hour
  },
]),
```

**Vevil status**: `@nestjs/throttler` installed, need to configure on auth routes ⚠️

### Role-Based Access Control (RBAC)
```typescript
@Roles('admin', 'manager')
@UseGuards(RolesGuard)
@Get('reports')
findAll() { ... }
```

## 4. Database Patterns

### Connection Pooling
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  extra: {
    connectionLimit: 20,  // Max connections in pool
    idleTimeout: 30000,
  },
  // ... other options
}),
```

### Transactions
```typescript
await this.dataSource.transaction(async (manager) => {
  const invoice = await manager.save(Invoice, invoiceData);
  for (const item of items) {
    await manager.save(InvoiceItem, { ...item, invoiceId: invoice.id });
  }
  await manager.update(Stock, item.stockId, { stock: ... });
});
```

### Repository Queries
**Avoid N+1**:
```typescript
// ❌ N+1 query
const customers = await this.customerRepo.find();
for (const c of customers) {
  c.invoices = await this.invoiceRepo.find({ customerId: c.id });
}

// ✅ Eager loading (relations)
const customers = await this.customerRepo.find({
  relations: ['invoices', 'payments']
});
```

### Indexing Strategy
```sql
-- Common queries in Vevil
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_backups_frequency_created ON backups(frequency, created_at DESC);
```

## 5. API Design

### REST Principles
- Resources as nouns (`/api/invoices`, NOT `/api/getInvoices`)
- HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE
- Versioning: `/api/v1/invoices` (currently `/api/invoices`)

### Pagination
```typescript
@Get()
async findAll(
  @Query('page') page = 1,
  @Query('limit') limit = 20
) {
  return this.invoicesRepo.find({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' }
  });
}
```

### Filtering & Sorting
```typescript
@Get()
async find(@Query() filters: InvoiceFiltersDto) {
  const qb = this.invoiceRepo.createQueryBuilder('invoice');
  if (filters.customerId) qb.andWhere('invoice.customerId = :cid', { cid: filters.customerId });
  if (filters.status) qb.andWhere('invoice.status = :status', { status: filters.status });
  if (filters.sortBy) qb.orderBy(`invoice.${filters.sortBy}`, filters.sortOrder || 'DESC');
  return qb.getMany();
}
```

### OpenAPI/Swagger
Already configured in Vevil (`@nestjs/swagger`). Improve with:
```typescript
@ApiTags('Invoices')
@ApiOperation({ summary: 'Create a new invoice' })
@ApiBody({ type: CreateInvoiceDto })
@ApiResponse({ status: 201, description: 'Invoice created', type: Invoice })
@Post()
async create(@Body() dto: CreateInvoiceDto) { ... }
```

## 6. Error Handling

### Custom Exceptions
```typescript
export class InvoiceNotFoundException extends HttpException {
  constructor(id: number) {
    super(
      {
        message: `Invoice #${id} not found`,
        code: 'INVOICE_NOT_FOUND',
        invoiceId: id,
      },
      HttpStatus.NOT_FOUND
    );
  }
}
```

### Error Response Format
Standardize responses:
```json
{
  "statusCode": 404,
  "timestamp": "2026-04-16T12:00:00Z",
  "path": "/api/invoices/999",
  "message": "Invoice not found",
  "error": "Not Found",
  "code": "INVOICE_NOT_FOUND"
}
```

## 7. Logging & Observability

### Structured Logging
```typescript
private readonly logger = new Logger(BackupService.name);

this.logger.log({
  message: 'Backup completed',
  backupId: backup.id,
  size: stats.size,
  frequency: backup.frequency,
  userId: req.user?.id,
});
```

### Request Context
```typescript
// Middleware to inject requestId
app.use((req, _res, next) => {
  req.requestId = uuid();
  next();
});

// Usage in service
this.logger.log(`Processing backup ${id}`, { requestId: req.requestId });
```

## 8. Caching Strategies

### In-Memory Cache
```typescript
@Injectable()
export class MetricsService {
  private cache = new Map<string, { data: any; ttl: number }>();

  async getMetrics(): Promise<Metrics> {
    const cached = this.cache.get('metrics');
    if (cached && Date.now() < cached.ttl) {
      return cached.data;
    }
    
    const metrics = await this.computeMetrics();
    this.cache.set('metrics', { data: metrics, ttl: Date.now() + 5 * 60 * 1000 }); // 5min
    return metrics;
  }
}
```

### Redis Cache (future)
```typescript
@CacheKey('metrics')
@CacheTTL(300) // 5 minutes
@Get('metrics')
findMetrics() {
  return this.metricsService.getMetrics();
}
```

## 9. Background Jobs

### Cron Jobs (already in Vevil)
```typescript
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async scheduledDailyBackup() { ... }
```

### Queue System (future)
Consider BullMQ for:
- Email sending (reminders, invoices)
- Report generation (async)
- Batch operations

## 10. Security Hardening

### Helmet
```typescript
import helmet from 'helmet';
app.use(helmet());
```

**Already partially done**: CORS whitelist ✅  
**Pending**: Helmet.js ⚠️, rate limiting on /auth ⚠️

### Input Sanitization
- Validate ALL inputs with DTOs (already using class-validator ✅)
- Escape HTML in outputs (prevent XSS)
- Limit file upload sizes

### SQL Injection Prevention
- TypeORM parameterized queries ✅ (safe)
- Never concatenate user input into SQL

### Rate Limiting
```typescript
// InAuthModule
ThrottlerModule.forRoot([{
  ttl: 60 * 60, // 1 hour
  limit: 10,    // 10 login attempts per hour
}])
```

## 11. Testing Backend

### Unit Tests
- Service layer: 70% coverage target
- Mock repositories/responses
- Test business logic only

### Integration Tests
- API endpoints: full request → response
- Database: test database (SQLite in-memory or Postgres testcontainer)

### E2E Tests
- Full stack: HTTP request → DB → response
- Supertest already in `backend-vevil/package.json`

Example:
```typescript
describe('BackupController (E2E)', () => {
  it('/POST /enabled toggles backup', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/backups/enabled')
      .send({ enabled: false })
      .expect(201);
    expect(response.body).toEqual({ success: true, enabled: false });
  });
});
```

## 12.部署 (Deployment)

### Environment Configuration
- `process.env.NODE_ENV === 'production'` for prod-only settings
- `.env` files for local dev
- Never commit secrets

### Health Checks
```typescript
@Get('health')
async healthCheck() {
  try {
    await this.dataSource.initialize();
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch {
    return { status: 'error', database: 'disconnected' };
  }
}
```

### Graceful Shutdown
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ...
  
  await app.listen(port);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}
```

## Vevil Backend Audit

### ✅ Already Implemented Well
- NestJS modular architecture
- TypeORM integration
- JWT authentication
- HttpOnly cookies
- CORS whitelist (recent fix)
- ValidationPipe global
- Swagger docs
- Scheduled tasks (cron)
- Logger (NestJS Logger)

### ⚠️ Needs Improvement
1. **Rate limiting** on `/auth` endpoints (10 attempts/hr)
2. **Helmet.js** security headers
3. **Health check endpoint** (`/api/health`)
4. **Request ID correlation** for tracing
5. **Structured JSON logging** (currently plain text)
6. **Metrics endpoint** (`/api/metrics`) for monitoring
7. **Error response standardization** (already has AllExceptionsFilter ✅)

### 🔴 High Priority Security
- Add Helmet middleware
- Apply `@UseGuards(ThrottlerGuard)` to AuthController
- Implement refresh token rotation (if not already)
- Audit logs for sensitive operations (already have audit entity ✅)

### 📈 Performance
- Connection pooling configured (already)
- Query indexing (check slow queries with EXPLAIN ANALYZE)
- Cache expensive queries (metrics, config)

## References

Full skill: `vevil-system/docs/cursor-skills/nodejs-backend-patterns/SKILL.md`  
Online: https://skills.sh/wshobson/agents/nodejs-backend-patterns

Related:
- `supabase-postgres-best-practices` - DB layer
- `systematic-debugging` - debugging methodology
- `typescript-advanced-types` - types in DTOs

---

**Category**: Backend Architecture  
**Impact**: HIGH (foundational)  
**Effort**: MEDIUM (incremental improvements)  
**Priority**: P1 (security & monitoring first)
