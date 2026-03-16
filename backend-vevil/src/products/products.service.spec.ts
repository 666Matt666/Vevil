import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: any;

  const mockProduct: Partial<Product> = {
    id: 1,
    name: 'Producto Test',
    type: 'fuel',
    price: 100,
    stock: 50,
    currency: 'PYG',
  };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of products with relations', async () => {
      repository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['invoiceItems'] });
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Product with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return product with defaults', async () => {
      const dto = { name: 'Nuevo', type: 'fuel', price: 10, stock: 5 };
      repository.create.mockReturnValue({ ...dto, currency: 'PYG', minStock: 0 });
      repository.save.mockResolvedValue({ id: 1, ...dto, currency: 'PYG', minStock: 0 });

      const result = await service.create(dto as any);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
