import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuditService } from '../audit/audit.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

describe('CustomersController', () => {
  let controller: CustomersController;
  let customersService: CustomersService;
  let auditService: AuditService;

  const mockCustomer = { id: 1, name: 'Cliente', email: 'c@test.com' };

  const mockCustomersService = {
    create: jest.fn().mockResolvedValue(mockCustomer),
    findAll: jest.fn().mockResolvedValue([mockCustomer]),
    findOne: jest.fn().mockResolvedValue(mockCustomer),
    update: jest.fn().mockResolvedValue({ ...mockCustomer, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    customersService = module.get<CustomersService>(CustomersService);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and audit', async () => {
      const dto: CreateCustomerDto = { name: 'Cliente', email: 'c@test.com' };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.create(dto, req);

      expect(customersService.create).toHaveBeenCalledWith(dto);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'customer.created', entityType: 'customer' }),
      );
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return list from service', async () => {
      const result = await controller.findAll();
      expect(customersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCustomer]);
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      const result = await controller.findOne('1');
      expect(customersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    it('should call service.update and audit', async () => {
      const dto: UpdateCustomerDto = { name: 'Updated' };
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      const result = await controller.update('1', dto, req);

      expect(customersService.findOne).toHaveBeenCalledWith(1);
      expect(customersService.update).toHaveBeenCalledWith(1, dto);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'customer.updated', entityId: '1' }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call service.remove and audit', async () => {
      const req = { user: { userId: 'u1', email: 'u@test.com' } };

      await controller.remove('1', req);

      expect(customersService.remove).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'customer.deleted', entityId: '1' }),
      );
    });
  });
});
