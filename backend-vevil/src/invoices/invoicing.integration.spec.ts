import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { CreateCustomerDto } from '../customers/dto/create-customer.dto';
import { CreateInvoiceDto } from '../invoices/dto/create-invoice.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { InvoicesService } from '../invoices/invoices.service';
import { UserRole } from '../users/entities/user-role.enum';

describe('Invoicing Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService!: UsersService;
  let productsService!: ProductsService;
  let customersService!: CustomersService;
  let invoicesService!: InvoicesService;
  let jwtService!: JwtService;
  let configService!: ConfigService;
  
  let authToken: string;
  let testProductId: number;
  let testCustomerId: number;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.initialize();
    await dataSource.synchronize(true);

    // Obtener servicios
    usersService = app.get<UsersService>(UsersService);
    productsService = app.get<ProductsService>(ProductsService);
    customersService = app.get<CustomersService>(CustomersService);
    invoicesService = app.get<InvoicesService>(InvoicesService);
    jwtService = app.get<JwtService>(JwtService);
    configService = app.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
    
    const adminDto: CreateUserDto = {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'admin123',
      role: UserRole.ADMIN,
    };
    await usersService.create(adminDto);
    
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'test-secret';
    // Obtener usuario para token
    const admin = await usersService.findOneByEmail('admin@test.com');
    authToken = jwtService.sign(
      { username: admin!.email, sub: admin!.id, role: admin!.role },
      { secret: jwtSecret, expiresIn: '15m' },
    );

    const productDto: CreateProductDto = {
      name: 'Producto Test',
      price: 1000,
      stock: 50,
      type: 'fuel',
      currency: 'PYG',
      minStock: 10,
    };
    const product = await productsService.create(productDto);
    testProductId = product.id;

    const customerDto: CreateCustomerDto = {
      name: 'Cliente Test',
      email: 'cliente@test.com',
    };
    const customer = await customersService.create(customerDto);
    testCustomerId = customer.id;
  });

  describe('POST /api/invoices', () => {
    it('crea factura y reduce stock en transacción', async () => {
      const invoiceDto: CreateInvoiceDto = {
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 5 }],
        status: 'pending',
        currency: 'PYG',
      };

      const initial = await productsService.findOne(testProductId);
      expect(initial.stock).toBe(50);

      const res = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceDto)
        .expect(201);

      expect(res.body.total).toBe(5000);
      const updated = await productsService.findOne(testProductId);
      expect(updated.stock).toBe(45);

      const invoice = await invoicesService.findOne(parseInt(res.body.id as any, 10));
      expect(invoice.items[0].quantity).toBe(5);
    });

    it('rollback si stock insuficiente', async () => {
      const invoiceDto: CreateInvoiceDto = {
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 100 }],
        status: 'pending',
        currency: 'PYG',
      };
      await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceDto)
        .expect(400);
      const product = await productsService.findOne(testProductId);
      expect(product.stock).toBe(50);
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('no permite editar factura pagada', async () => {
      const createDto: CreateInvoiceDto = {
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 2 }],
        status: 'pending',
        currency: 'PYG',
      };
      const created = await invoicesService.create(createDto);
      await invoicesService.updateStatus(created.id, 'paid');

      await request(app.getHttpServer())
        .put(`/api/invoices/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'cancelled' })
        .expect(400);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('no permite eliminar factura con pagos', async () => {
      const createDto: CreateInvoiceDto = {
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 1 }],
        status: 'pending',
        currency: 'PYG',
      };
      const invoice = await invoicesService.create(createDto);
      await invoicesService.addPayment(invoice.id, { amount: 1000, method: 'cash' });

      await request(app.getHttpServer())
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('permite eliminar factura pendiente sin pagos', async () => {
      const createDto: CreateInvoiceDto = {
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 1 }],
        status: 'pending',
        currency: 'PYG',
      };
      const invoice = await invoicesService.create(createDto);

      await request(app.getHttpServer())
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
