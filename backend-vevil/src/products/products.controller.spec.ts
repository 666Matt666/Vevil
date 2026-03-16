import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;
  let auditService: AuditService;

  const mockProduct = { id: 1, name: 'Producto', type: 'item', price: 100, stock: 10 };

  const mockProductsService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue([mockProduct]),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and audit', async () => {
      const dto: CreateProductDto = { name: 'Producto', type: 'item', price: 100, stock: 10 };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.create(dto, req);

      expect(productsService.create).toHaveBeenCalledWith(dto);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'product.created', entityType: 'product' }),
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return list from service', async () => {
      const result = await controller.findAll();
      expect(productsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      const result = await controller.findOne('1');
      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should call service.update and audit', async () => {
      const dto: UpdateProductDto = { name: 'Updated' };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.update('1', dto, req);

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(productsService.update).toHaveBeenCalledWith(1, dto);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'product.updated', entityId: '1' }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call service.remove and audit', async () => {
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      await controller.remove('1', req);

      expect(productsService.remove).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'product.deleted', entityId: '1' }),
      );
    });
  });
});
