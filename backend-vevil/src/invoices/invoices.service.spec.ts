import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { MailService } from '../mail/mail.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoicesRepository: any;
  let paymentsRepository: any;
  let productsService: jest.Mocked<ProductsService>;
  let customersService: jest.Mocked<CustomersService>;
  let mailService: jest.Mocked<MailService>;
  let queryRunner: any;

  const mockCustomer: Partial<Customer> = {
    id: 1,
    name: 'Cliente',
    email: 'cliente@test.com',
  };
  const mockProduct: Partial<Product> = {
    id: 1,
    name: 'Producto',
    price: 100,
    stock: 10,
  };
  const mockInvoice: Partial<Invoice> = {
    id: 1,
    customerId: 1,
    total: 200,
    status: 'pending',
    customer: mockCustomer as Customer,
    items: [],
    payments: [],
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
      manager: {
        save: jest.fn().mockResolvedValue(mockInvoice),
      },
      connection: {
        options: {
          type: 'sqlite',
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CustomersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: StockMovementsService,
          useValue: {
            recordSale: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPaymentReminderEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoicesRepository = module.get(getRepositoryToken(Invoice));
    paymentsRepository = module.get(getRepositoryToken(Payment));
    productsService = module.get(ProductsService) as jest.Mocked<ProductsService>;
    customersService = module.get(CustomersService) as jest.Mocked<CustomersService>;
    mailService = module.get(MailService) as jest.Mocked<MailService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of invoices with relations', async () => {
      invoicesRepository.find.mockResolvedValue([mockInvoice]);

      const result = await service.findAll();
      expect(result).toEqual([mockInvoice]);
      expect(invoicesRepository.find).toHaveBeenCalledWith({
        relations: ['customer', 'items', 'items.product', 'payments'],
      });
    });
  });

  describe('findOne', () => {
    it('should return invoice when found', async () => {
      invoicesRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.findOne(1);
      expect(result).toEqual(mockInvoice);
      expect(invoicesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['customer', 'items', 'items.product', 'payments'],
      });
    });

    it('should throw NotFoundException when invoice not found', async () => {
      invoicesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Invoice with ID 999 not found');
    });
  });

  describe('updateStatus', () => {
    it('should update and return invoice', async () => {
      invoicesRepository.findOne.mockResolvedValue({ ...mockInvoice, status: 'pending' });
      invoicesRepository.save.mockImplementation((inv: any) => Promise.resolve({ ...inv }));

      const result = await service.updateStatus(1, 'paid');
      expect(invoicesRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('paid');
    });
  });

  describe('getPayments', () => {
    it('should return payments for invoice', async () => {
      invoicesRepository.findOne.mockResolvedValue(mockInvoice);
      const payments = [{ id: 1, amount: 100, invoiceId: 1 }];
      paymentsRepository.find.mockResolvedValue(payments);

      const result = await service.getPayments(1);
      expect(result).toEqual(payments);
      expect(paymentsRepository.find).toHaveBeenCalledWith({
        where: { invoiceId: 1 },
        order: { date: 'DESC' },
      });
    });
  });

  describe('addPayment', () => {
    it('should create and save payment', async () => {
      invoicesRepository.findOne.mockResolvedValue(mockInvoice);
      const savedPayment = { id: 1, invoiceId: 1, amount: 50, method: 'cash' };
      paymentsRepository.create.mockReturnValue(savedPayment);
      paymentsRepository.save.mockResolvedValue(savedPayment);

      const result = await service.addPayment(1, { amount: 50, method: 'cash' });
      expect(paymentsRepository.create).toHaveBeenCalledWith({
        invoiceId: 1,
        amount: 50,
        method: 'cash',
      });
      expect(paymentsRepository.save).toHaveBeenCalledWith(savedPayment);
      expect(result).toEqual(savedPayment);
    });
  });

  describe('create', () => {
    it('should create invoice and deduct stock when stock is sufficient', async () => {
      customersService.findOne.mockResolvedValue(mockCustomer as Customer);
      // Mock query to return product for SELECT and succeed for UPDATE
      queryRunner.query.mockResolvedValueOnce([{ id: 1, name: 'Producto', price: 100, stock: 10 }]);

      const result = await service.create({
        customerId: 1,
        items: [{ productId: 1, quantity: 2 }],
      } as CreateInvoiceDto);

      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      // Verify stock was deducted via query
      expect(queryRunner.query).toHaveBeenCalledWith(
        'UPDATE product SET stock = stock - $1 WHERE id = $2',
        [2, 1],
      );
      expect(result).toEqual(mockInvoice);
    });

    it('should throw BadRequestException and rollback when stock insufficient', async () => {
      customersService.findOne.mockResolvedValue(mockCustomer as Customer);
      // Mock query to return product with insufficient stock
      queryRunner.query.mockResolvedValueOnce([{ id: 1, name: 'Producto', price: 100, stock: 1 }]);

      await expect(
        service.create({
          customerId: 1,
          items: [{ productId: 1, quantity: 5 }],
        } as CreateInvoiceDto),
      ).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      customersService.findOne.mockRejectedValue(new NotFoundException('Customer with ID 999 not found'));

      await expect(
        service.create({
          customerId: 999,
          items: [{ productId: 1, quantity: 1 }],
        } as CreateInvoiceDto),
      ).rejects.toThrow(NotFoundException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(productsService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('sendReminder', () => {
    it('should send reminder and return { sent: true } for pending invoice with customer email', async () => {
      invoicesRepository.findOne.mockResolvedValue({ ...mockInvoice, status: 'pending', customer: mockCustomer });

      const result = await service.sendReminder(1);

      expect(result).toEqual({ sent: true });
      expect(mailService.sendPaymentReminderEmail).toHaveBeenCalledWith(
        'cliente@test.com',
        'Cliente',
        '0000001',
        200,
        'PYG',
      );
    });

    it('should return { sent: false } when invoice is not pending', async () => {
      invoicesRepository.findOne.mockResolvedValue({ ...mockInvoice, status: 'paid' });

      const result = await service.sendReminder(1);

      expect(result).toEqual({ sent: false, reason: 'Solo se pueden enviar recordatorios de facturas pendientes.' });
    });

    it('should return { sent: false } when customer has no email', async () => {
      invoicesRepository.findOne.mockResolvedValue({
        ...mockInvoice,
        status: 'pending',
        customer: { ...mockCustomer, email: '' },
      });

      const result = await service.sendReminder(1);

      expect(result).toEqual({ sent: false, reason: 'El cliente no tiene email registrado.' });
    });
  });
});
