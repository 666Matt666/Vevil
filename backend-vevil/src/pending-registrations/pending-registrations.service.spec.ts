import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PendingRegistrationsService } from './pending-registrations.service';
import { PendingRegistration } from './pending-registration.entity';
import { UsersService } from '@/users/users.service';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@/users/entities/user-role.enum';

describe('PendingRegistrationsService', () => {
  let service: PendingRegistrationsService;
  let repo: any;
  let usersService: any;
  let mailService: any;
  let configService: any;

  const mockPendingRegistration = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    status: 'pending_email',
    emailConfirmationToken: 'token123',
    emailConfirmationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn((data) => ({ id: Math.random(), ...data })),
      save: jest.fn((data) => Promise.resolve({ id: '1', ...data })),
      update: jest.fn().mockResolvedValue({}),
    };

    usersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      setResetPasswordToken: jest.fn().mockResolvedValue({}),
    };

    mailService = {
      sendRegistrationConfirmationEmail: jest.fn().mockResolvedValue({}),
      sendSetPasswordEmail: jest.fn().mockResolvedValue({}),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'FRONTEND_URL') return 'http://localhost:5173';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingRegistrationsService,
        { provide: getRepositoryToken(PendingRegistration), useValue: repo },
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<PendingRegistrationsService>(PendingRegistrationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequest', () => {
    it('should create a new pending registration', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      repo.findOne.mockResolvedValue(null);

      const result = await service.createRequest({
        email: 'new@example.com',
        name: 'New User',
      });

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(mailService.sendRegistrationConfirmationEmail).toHaveBeenCalled();
      expect(result.message).toContain('Revisá tu correo');
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findOneByEmail.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(
        service.createRequest({ email: 'existing@example.com', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should regenerate token if pending_email exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration, status: 'pending_email' });

      const result = await service.createRequest({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(repo.update).toHaveBeenCalled();
      expect(mailService.sendRegistrationConfirmationEmail).toHaveBeenCalled();
      expect(result.message).toContain('te enviamos de nuevo');
    });

    it('should return message if pending_approval exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration, status: 'pending_approval' });

      const result = await service.createRequest({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(repo.save).not.toHaveBeenCalled();
      expect(result.message).toContain('solicitud en revisión');
    });

    it('should throw BadRequestException if rejected', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration, status: 'rejected' });

      await expect(
        service.createRequest({ email: 'test@example.com', name: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email with valid token', async () => {
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration });

      const result = await service.confirmEmail('token123');

      expect(repo.update).toHaveBeenCalled();
      expect(result.message).toContain('correo fue confirmado');
    });

    it('should throw BadRequestException with invalid token', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.confirmEmail('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with expired token', async () => {
      repo.findOne.mockResolvedValue({
        ...mockPendingRegistration,
        emailConfirmationExpires: new Date(Date.now() - 1000),
      });

      await expect(service.confirmEmail('token123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllPending', () => {
    it('should return all pending approvals', async () => {
      const pending = [{ id: '1', status: 'pending_approval' }];
      repo.find.mockResolvedValue(pending);

      const result = await service.findAllPending();

      expect(repo.find).toHaveBeenCalledWith({
        where: { status: 'pending_approval' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(pending);
    });
  });

  describe('countPending', () => {
    it('should return count of pending approvals', async () => {
      repo.count.mockResolvedValue(5);

      const result = await service.countPending();

      expect(repo.count).toHaveBeenCalledWith({ where: { status: 'pending_approval' } });
      expect(result).toBe(5);
    });
  });

  describe('approve', () => {
    it('should approve and create user', async () => {
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration, status: 'pending_approval' });
      usersService.create.mockResolvedValue({ id: '1' });
      usersService.setResetPasswordToken.mockResolvedValue({});

      const result = await service.approve('1', UserRole.USER);

      expect(usersService.create).toHaveBeenCalled();
      expect(usersService.setResetPasswordToken).toHaveBeenCalled();
      expect(mailService.sendSetPasswordEmail).toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('1', { status: 'approved' });
      expect(result.message).toContain('aprobado');
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.approve('999', UserRole.USER)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('should reject a pending registration', async () => {
      repo.findOne.mockResolvedValue({ ...mockPendingRegistration, status: 'pending_approval' });

      const result = await service.reject('1');

      expect(repo.update).toHaveBeenCalledWith('1', { status: 'rejected' });
      expect(result.message).toContain('rechazada');
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.reject('999')).rejects.toThrow(NotFoundException);
    });
  });
});
