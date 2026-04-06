import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BackupService } from './backup.service';
import { Backup, BackupType, BackupStatus, BackupFrequency, BackupSlot } from './backup.entity';

describe('BackupService', () => {
  let service: BackupService;
  let repository: any;

  const mockBackup: Partial<Backup> = {
    id: 'test-uuid',
    type: BackupType.FULL,
    frequency: BackupFrequency.DIARIO,
    slot: BackupSlot.DIARIO_1,
    status: BackupStatus.COMPLETED,
    filePath: '/tmp/backup.sql',
    fileSize: 1024,
    createdAt: new Date(),
    completedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        {
          provide: getRepositoryToken(Backup),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailySlot', () => {
    it('should return DIARIO_1 on Sunday', () => {
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(0);
      expect(service.getDailySlot()).toBe(BackupSlot.DIARIO_1);
    });

    it('should return DIARIO_2 on Monday', () => {
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(1);
      expect(service.getDailySlot()).toBe(BackupSlot.DIARIO_2);
    });

    it('should return DIARIO_3 on other days', () => {
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(3);
      expect(service.getDailySlot()).toBe(BackupSlot.DIARIO_3);
    });
  });

  describe('getWeeklySlot', () => {
    it('should return a valid weekly slot', () => {
      const slot = service.getWeeklySlot();
      expect(slot).toMatch(/semanal_[1-4]/);
    });
  });

  describe('getMonthlySlot', () => {
    it('should return a valid monthly slot', () => {
      const slot = service.getMonthlySlot();
      expect(slot).toMatch(/mensual_[1-3]/);
    });
  });

  describe('getBackups', () => {
    it('should return list of backups ordered by createdAt', async () => {
      repository.find.mockResolvedValue([mockBackup]);

      const result = await service.getBackups(10);
      expect(result).toEqual([mockBackup]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });
  });

  describe('getBackupById', () => {
    it('should return backup when found', async () => {
      repository.findOne.mockResolvedValue(mockBackup);

      const result = await service.getBackupById('test-uuid');
      expect(result).toEqual(mockBackup);
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.getBackupById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('triggerManualBackup', () => {
    it('should create a manual backup', async () => {
      repository.create.mockReturnValue(mockBackup);
      repository.save.mockResolvedValue({ ...mockBackup, id: 'new-uuid' });

      const result = await service.triggerManualBackup();
      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});