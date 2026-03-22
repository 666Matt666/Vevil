import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovement } from './stock-movement.entity';
import { ProductsService } from '../products/products.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let movementRepo: any;
  let productsService: any;

  const mockProduct = { id: 1, name: 'Gasolina', stock: 100 };

  beforeEach(async () => {
    movementRepo = {
      create: jest.fn((data) => ({ id: Math.random(), ...data })),
      save: jest.fn((data) => Promise.resolve({ id: 1, ...data })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    productsService = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: getRepositoryToken(StockMovement), useValue: movementRepo },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an "in" movement and increase stock', async () => {
      productsService.findOne.mockResolvedValue({ ...mockProduct });
      productsService.update.mockResolvedValue({});

      const dto = { productId: 1, type: 'in' as const, quantity: 50, reason: 'purchase' };
      const result = await service.create(dto);

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(productsService.update).toHaveBeenCalledWith(1, { stock: 150 });
      expect(movementRepo.create).toHaveBeenCalled();
      expect(movementRepo.save).toHaveBeenCalled();
      expect(result.type).toBe('in');
    });

    it('should create an "out" movement and decrease stock', async () => {
      productsService.findOne.mockResolvedValue({ ...mockProduct });
      productsService.update.mockResolvedValue({});

      const dto = { productId: 1, type: 'out' as const, quantity: 30, reason: 'adjustment_out' };
      const result = await service.create(dto);

      expect(productsService.update).toHaveBeenCalledWith(1, { stock: 70 });
      expect(result.type).toBe('out');
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      productsService.findOne.mockResolvedValue({ ...mockProduct, stock: 10 });

      const dto = { productId: 1, type: 'out' as const, quantity: 50, reason: 'adjustment_out' };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Stock insuficiente');
    });

    it('should throw NotFoundException when product not found', async () => {
      productsService.findOne.mockRejectedValue(new NotFoundException());

      const dto = { productId: 999, type: 'in' as const, quantity: 10, reason: 'purchase' };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordSale', () => {
    it('should record a sale movement', async () => {
      productsService.findOne.mockResolvedValue({ ...mockProduct });

      const result = await service.recordSale(1, 20, 100);

      expect(movementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 1,
          type: 'out',
          quantity: 20,
          reason: 'sale',
          invoiceId: 100,
        }),
      );
      expect(movementRepo.save).toHaveBeenCalled();
      expect(result.type).toBe('out');
      expect(result.reason).toBe('sale');
    });
  });

  describe('findAll', () => {
    it('should return all movements', async () => {
      const mockMovements = [
        { id: 1, type: 'in', quantity: 50 },
        { id: 2, type: 'out', quantity: 20 },
      ];
      movementRepo.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMovements),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockMovements);
    });

    it('should filter by productId', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      movementRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ productId: 1 });

      expect(qb.andWhere).toHaveBeenCalledWith('m.productId = :productId', { productId: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a movement by id', async () => {
      const mockMovement = { id: 1, type: 'in', quantity: 50 };
      movementRepo.findOne.mockResolvedValue(mockMovement);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovement);
      expect(movementRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['product'],
      });
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
