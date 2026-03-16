import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: any;

  const mockCustomer: Partial<Customer> = {
    id: 1,
    name: 'Cliente Test',
    email: 'cliente@test.com',
    phones: [],
  };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of customers', async () => {
      repository.find.mockResolvedValue([mockCustomer]);

      const result = await service.findAll();
      expect(result).toEqual([mockCustomer]);
      expect(repository.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      repository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCustomer);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when customer not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return customer', async () => {
      const dto = { name: 'Nuevo', email: 'nuevo@test.com' };
      repository.create.mockReturnValue({ ...dto, id: 1 });
      repository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, name: 'Nuevo', email: 'nuevo@test.com' });
    });
  });
});
