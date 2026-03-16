import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repo: jest.Mocked<Repository<AuditLog>>;

  const mockAuditLog: Partial<AuditLog> = {
    id: 1,
    userId: 'user-uuid',
    userEmail: 'user@test.com',
    action: 'invoice.created',
    entityType: 'invoice',
    entityId: '1',
    oldValue: null,
    newValue: { total: 100 },
    ip: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn().mockReturnValue(mockAuditLog),
      save: jest.fn().mockResolvedValue(mockAuditLog),
      find: jest.fn().mockResolvedValue([mockAuditLog]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repo = module.get(getRepositoryToken(AuditLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an audit log entry', async () => {
      const payload = {
        userId: 'user-uuid',
        userEmail: 'user@test.com',
        action: 'invoice.created',
        entityType: 'invoice',
        entityId: '1',
        newValue: { total: 100 },
        ip: '127.0.0.1',
      };

      const result = await service.log(payload);

      expect(repo.create).toHaveBeenCalledWith({
        userId: payload.userId,
        userEmail: payload.userEmail,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        oldValue: null,
        newValue: payload.newValue,
        ip: payload.ip,
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(mockAuditLog);
    });

    it('should allow null optional fields', async () => {
      await service.log({
        action: 'auth.login',
        entityType: 'auth',
        entityId: null,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          userEmail: null,
          entityId: null,
          oldValue: null,
          newValue: null,
          ip: null,
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return logs for the given userId with default limit', async () => {
      const result = await service.findByUser('user-uuid');

      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual([mockAuditLog]);
    });

    it('should use custom limit when provided', async () => {
      await service.findByUser('user-uuid', 10);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('findByEntity', () => {
    it('should return logs for the given entity with default limit', async () => {
      const result = await service.findByEntity('invoice', '1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { entityType: 'invoice', entityId: '1' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual([mockAuditLog]);
    });

    it('should use custom limit when provided', async () => {
      await service.findByEntity('customer', '2', 20);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });
  });

  describe('findRecent', () => {
    it('should return recent logs with default limit', async () => {
      const result = await service.findRecent();

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual([mockAuditLog]);
    });

    it('should use custom limit when provided', async () => {
      await service.findRecent(25);

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 25,
      });
    });
  });
});
