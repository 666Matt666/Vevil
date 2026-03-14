import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { MailService } from '@/mail/mail.service';
import { User } from '@/users/user.entity';
import { UserRole } from '@/users/entities/user-role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailService: jest.Mocked<MailService>;

  const mockUser: User = {
    id: 'user-uuid',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOne: jest.fn(),
            findOneByResetToken: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            setResetPasswordToken: jest.fn(),
            clearResetPasswordToken: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => (key === 'JWT_SECRET' ? 'secret' : key === 'JWT_REFRESH_SECRET' ? 'refresh-secret' : undefined)),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    mailService = module.get(MailService) as jest.Mocked<MailService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when password does not match', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and refresh_token', async () => {
      jwtService.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      usersService.update.mockResolvedValue(undefined);

      const result = await service.login({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      } as any);

      expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh' });
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({ hashedRefreshToken: expect.any(String) }));
    });
  });

  describe('register', () => {
    it('should create user and return without password', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.count.mockResolvedValue(1);
      const created = { ...mockUser, email: 'new@example.com', name: 'New User', password: 'hashed' };
      usersService.create.mockResolvedValue(created);

      const result = await service.register({
        email: 'new@example.com',
        name: 'New User',
        password: 'secret',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('new@example.com');
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', name: 'Test', password: 'pass' }),
      ).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should set token and send email when user exists', async () => {
      usersService.setResetPasswordToken.mockResolvedValue(true);
      configService.get.mockReturnValue('https://app.example.com');

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toContain('recibirás instrucciones');
      expect(usersService.setResetPasswordToken).toHaveBeenCalledWith('test@example.com', expect.any(String), expect.any(Date));
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith('test@example.com', expect.stringContaining('/reset-password?token='));
    });

    it('should return same message when user does not exist (no leak)', async () => {
      usersService.setResetPasswordToken.mockResolvedValue(false);

      const result = await service.forgotPassword('nobody@example.com');

      expect(result.message).toContain('recibirás instrucciones');
      expect(mailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should update password and clear token when token is valid', async () => {
      usersService.findOneByResetToken.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      usersService.update.mockResolvedValue(undefined);
      usersService.clearResetPasswordToken.mockResolvedValue(undefined);

      const result = await service.resetPassword('valid-token', 'newPassword123');

      expect(result.message).toContain('actualizada');
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, { password: 'new-hash' });
      expect(usersService.clearResetPasswordToken).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException when token is invalid', async () => {
      usersService.findOneByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'newPass')).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      usersService.update.mockResolvedValue(undefined);

      await service.logout('user-id');
      expect(usersService.update).toHaveBeenCalledWith('user-id', { hashedRefreshToken: null });
    });
  });
});
