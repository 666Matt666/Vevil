import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let service: AuditService;

  const mockLogs = [
    {
      id: 1,
      userId: 'user-uuid',
      userEmail: 'user@test.com',
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: '1',
      createdAt: new Date(),
    },
  ];

  const mockAuditService = {
    findByUser: jest.fn().mockResolvedValue(mockLogs),
    findByEntity: jest.fn().mockResolvedValue(mockLogs),
    findRecent: jest.fn().mockResolvedValue(mockLogs),
    getTotalCount: jest.fn().mockResolvedValue(mockLogs.length),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockAuditService }],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call findByUser when userId query is provided', async () => {
      const result = await controller.list('user-uuid', undefined, undefined, '50');

      expect(service.findByUser).toHaveBeenCalledWith('user-uuid', 50);
      expect(service.findByEntity).not.toHaveBeenCalled();
      expect(service.findRecent).not.toHaveBeenCalled();
      expect(result).toEqual({ data: mockLogs, total: mockLogs.length });
    });

    it('should call findByEntity when entityType and entityId are provided', async () => {
      const result = await controller.list(
        undefined,
        'invoice',
        '1',
        '30',
      );

      expect(service.findByEntity).toHaveBeenCalledWith('invoice', '1', 30);
      expect(service.findByUser).not.toHaveBeenCalled();
      expect(service.findRecent).not.toHaveBeenCalled();
      expect(result).toEqual({ data: mockLogs, total: mockLogs.length });
    });

    it('should call findRecent when no filters are provided', async () => {
      const result = await controller.list(undefined, undefined, undefined, undefined);

      expect(service.findRecent).toHaveBeenCalledWith(50, 0);
      expect(service.findByUser).not.toHaveBeenCalled();
      expect(service.findByEntity).not.toHaveBeenCalled();
      expect(result).toEqual({ data: mockLogs, total: mockLogs.length });
    });

    it('should cap limit at 200 and use default 50 for invalid values', async () => {
      await controller.list(undefined, undefined, undefined, '999');
      expect(service.findRecent).toHaveBeenCalledWith(200, 0);

      await controller.list(undefined, undefined, undefined, 'invalid');
      expect(service.findRecent).toHaveBeenCalledWith(50, 0);
    });

    it('userId takes precedence over entity params', async () => {
      await controller.list('user-uuid', 'invoice', '1', '10');
      expect(service.findByUser).toHaveBeenCalledWith('user-uuid', 10);
      expect(service.findByEntity).not.toHaveBeenCalled();
    });
  });
});
