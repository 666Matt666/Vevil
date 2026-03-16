import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { AuditService } from '../audit/audit.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let invoicesService: InvoicesService;
  let auditService: AuditService;

  const mockInvoice = { id: 1, customerId: 1, total: 100, status: 'pending', items: [], payments: [] };
  const mockPayment = { id: 1, amount: 50, invoiceId: 1 };

  const mockInvoicesService = {
    create: jest.fn().mockResolvedValue(mockInvoice),
    findAll: jest.fn().mockResolvedValue([mockInvoice]),
    findOne: jest.fn().mockResolvedValue(mockInvoice),
    updateStatus: jest.fn().mockResolvedValue({ ...mockInvoice, status: 'paid' }),
    getPayments: jest.fn().mockResolvedValue([mockPayment]),
    addPayment: jest.fn().mockResolvedValue(mockPayment),
    sendReminder: jest.fn().mockResolvedValue({ sent: true }),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        { provide: InvoicesService, useValue: mockInvoicesService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    invoicesService = module.get<InvoicesService>(InvoicesService);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call invoicesService.create and return created invoice', async () => {
      const dto: CreateInvoiceDto = { customerId: 1, items: [{ productId: 1, quantity: 2 }] };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.create(dto, req);

      expect(invoicesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockInvoice);
    });

    it('should call auditService.log with invoice.created action', async () => {
      const dto: CreateInvoiceDto = { customerId: 1, items: [{ productId: 1, quantity: 1 }] };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      await controller.create(dto, req);

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invoice.created', entityType: 'invoice' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return list from service', async () => {
      const result = await controller.findAll();
      expect(invoicesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockInvoice]);
    });
  });

  describe('findOne', () => {
    it('should return invoice by id', async () => {
      const result = await controller.findOne('1');
      expect(invoicesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('updateStatus', () => {
    it('should call service and audit', async () => {
      const dto: UpdateInvoiceStatusDto = { status: 'paid' };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.updateStatus('1', dto, req);

      expect(invoicesService.findOne).toHaveBeenCalledWith(1);
      expect(invoicesService.updateStatus).toHaveBeenCalledWith(1, 'paid');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invoice.status_updated' }),
      );
      expect(result.status).toBe('paid');
    });
  });

  describe('getPayments', () => {
    it('should return payments for invoice', async () => {
      const result = await controller.getPayments('1');
      expect(invoicesService.getPayments).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockPayment]);
    });
  });

  describe('addPayment', () => {
    it('should add payment and audit', async () => {
      const dto: CreatePaymentDto = { amount: 50 };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.addPayment('1', dto, req);

      expect(invoicesService.addPayment).toHaveBeenCalledWith(1, dto);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invoice.payment_added' }),
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('sendReminder', () => {
    it('should send reminder and audit', async () => {
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.sendReminder('1', req);

      expect(invoicesService.sendReminder).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invoice.reminder_sent' }),
      );
      expect(result).toEqual({ sent: true });
    });
  });
});
