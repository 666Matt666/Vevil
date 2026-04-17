import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';

jest.mock('resend');

describe('MailService', () => {
  let service: MailService;
  let configService: any;
  const mockResendInstance = {
    emails: {
      send: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Resend as jest.Mock).mockClear();
    (Resend as jest.Mock).mockReturnValue(mockResendInstance);
  });

  async function createService(configOverrides: Record<string, any> = {}) {
    configService = {
      get: jest.fn((key: string) => {
        const defaults: Record<string, any> = {
          RESEND_API_KEY: 'test-resend-key',
          NODE_ENV: 'test',
        };
        // Use hasOwnProperty to differentiate between undefined and missing
        if (Object.prototype.hasOwnProperty.call(configOverrides, key)) {
          return configOverrides[key];
        }
        return defaults[key] ?? null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return module.get<MailService>(MailService);
  }

  it('should be defined', async () => {
    service = await createService();
    expect(service).toBeDefined();
  });

  describe('isConfigured', () => {
    it('should return true when RESEND_API_KEY is set', async () => {
      service = await createService();
      expect(service.isConfigured()).toBe(true);
      expect(Resend).toHaveBeenCalledWith('test-resend-key');
    });

    it('should return false when RESEND_API_KEY is not set', async () => {
      service = await createService({ RESEND_API_KEY: undefined });
      expect(service.isConfigured()).toBe(false);
      expect(Resend).not.toHaveBeenCalled();
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email when configured', async () => {
      service = await createService();
      await service.sendResetPasswordEmail('user@example.com', 'https://example.com/reset');

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Restablecer'),
        }),
      );
    });

    it('should log link in development when not configured', async () => {
      service = await createService({ RESEND_API_KEY: undefined, NODE_ENV: 'development' });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.sendResetPasswordEmail('user@example.com', 'https://example.com/reset');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Mail] Reset password link (RESEND not configured):',
        'https://example.com/reset',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sendRegistrationConfirmationEmail', () => {
    it('should send confirmation email when configured', async () => {
      service = await createService();
      await service.sendRegistrationConfirmationEmail('user@example.com', 'https://example.com/confirm');

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Confirmá'),
        }),
      );
    });
  });

  describe('sendPaymentReminderEmail', () => {
    it('should send payment reminder email when configured', async () => {
      service = await createService();
      await service.sendPaymentReminderEmail('customer@example.com', 'John Doe', 'INV-001', 100000, 'PYG');

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Recordatorio'),
        }),
      );
    });
  });

  describe('sendSetPasswordEmail', () => {
    it('should send set password email when configured', async () => {
      service = await createService();
      await service.sendSetPasswordEmail('user@example.com', 'https://example.com/set-password');

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Creá'),
        }),
      );
    });
  });
});
