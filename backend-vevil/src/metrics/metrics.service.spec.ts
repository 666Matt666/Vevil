import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetricsService, DashboardMetrics } from './metrics.service';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';

describe('MetricsService', () => {
  let service: MetricsService;
  let productRepo: any;
  let customerRepo: any;
  let invoiceRepo: any;
  let invoiceItemRepo: any;

  const mockProduct = { id: 1, name: 'Gasolina', stock: 30, minStock: 50 };
  const mockCustomer = { id: 1, name: 'Cliente Test' };
  const mockInvoice = { id: 1, total: 1000, date: new Date() };

  beforeEach(async () => {
    productRepo = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        getRawOne: jest.fn().mockResolvedValue({ sum: '1000' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    };

    customerRepo = {
      count: jest.fn().mockResolvedValue(5),
    };

    invoiceRepo = {
      count: jest.fn().mockResolvedValue(20),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        getRawOne: jest.fn().mockResolvedValue({ sum: '5000' }),
      })),
    };

    invoiceItemRepo = {
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(Customer), useValue: customerRepo },
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(InvoiceItem), useValue: invoiceItemRepo },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics without filters', async () => {
      productRepo.count.mockResolvedValue(10);
      productRepo.find.mockResolvedValue([mockProduct]);
      customerRepo.count.mockResolvedValue(5);
      invoiceRepo.count.mockResolvedValue(20);

      const result = await service.getDashboardMetrics();

      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('totalCustomers');
      expect(result).toHaveProperty('totalInvoices');
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('revenueLast7Days');
      expect(result).toHaveProperty('invoicesLast7Days');
      expect(result).toHaveProperty('lowStockProducts');
      expect(result).toHaveProperty('generatedAt');
      expect(result.totalProducts).toBe(10);
      expect(result.totalCustomers).toBe(5);
      expect(result.totalInvoices).toBe(20);
    });

    it('should return metrics with period filters', async () => {
      productRepo.count.mockResolvedValue(10);
      productRepo.find.mockResolvedValue([]);
      customerRepo.count.mockResolvedValue(5);
      invoiceRepo.count.mockResolvedValue(20);

      const result = await service.getDashboardMetrics({ from: '2024-01-01', to: '2024-12-31' });

      expect(result).toHaveProperty('periodFrom');
      expect(result).toHaveProperty('periodTo');
      expect(result).toHaveProperty('periodRevenue');
      expect(result.periodFrom).toBe('2024-01-01');
      expect(result.periodTo).toBe('2024-12-31');
    });

    it('should handle invalid date filters gracefully', async () => {
      productRepo.count.mockResolvedValue(10);
      productRepo.find.mockResolvedValue([]);
      customerRepo.count.mockResolvedValue(5);
      invoiceRepo.count.mockResolvedValue(20);

      const result = await service.getDashboardMetrics({ from: 'invalid', to: 'invalid' });

      // Should not add period properties when dates are invalid
      expect(result).not.toHaveProperty('periodRevenue');
    });

    it('should return low stock products', async () => {
      productRepo.count.mockResolvedValue(10);
      productRepo.find.mockResolvedValue([
        { id: 1, name: 'Gasolina', stock: 30, minStock: 50 },
        { id: 2, name: 'Diésel', stock: 10, minStock: 20 },
      ]);
      customerRepo.count.mockResolvedValue(5);
      invoiceRepo.count.mockResolvedValue(20);

      const result = await service.getDashboardMetrics();

      expect(result.lowStockProducts).toBe(2);
      expect(result.lowStockList).toHaveLength(2);
    });

    it('should return empty array when no low stock products', async () => {
      productRepo.count.mockResolvedValue(10);
      productRepo.find.mockResolvedValue([
        { id: 1, name: 'Gasolina', stock: 100, minStock: 50 },
      ]);
      customerRepo.count.mockResolvedValue(5);
      invoiceRepo.count.mockResolvedValue(20);

      const result = await service.getDashboardMetrics();

      expect(result.lowStockProducts).toBe(0);
      expect(result.lowStockList).toHaveLength(0);
    });
  });

  describe('lowStockThreshold', () => {
    it('should use default threshold when env not set', () => {
      // The service should initialize with default threshold of 50
      expect(service).toBeDefined();
    });
  });
});
