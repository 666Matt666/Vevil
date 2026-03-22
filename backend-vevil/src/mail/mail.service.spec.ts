import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: any;
  let configService: any;

  beforeEach(async () => {
    mailerService = {
      sendMail: jest.fn().mockResolvedValue({}),
    };

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string | undefined> = {
          MAIL_HOST: 'smtp.example.com',
          MAIL_FROM: 'noreply@vevil.com',
          MAIL_FROM_NAME: 'Vevil',
          NODE_ENV: 'test',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isConfigured', () => {
    it('should return true when MAIL_HOST is set', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when MAIL_HOST is not set', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_HOST') return undefined;
        return null;
      });

      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email when configured', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.sendResetPasswordEmail('user@example.com', 'https://example.com/reset');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Restablecer'),
        }),
      );

      consoleSpy.mockRestore();
    });

    it('should log link in development when not configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_HOST') return undefined;
        if (key === 'NODE_ENV') return 'development';
        return null;
      });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.sendResetPasswordEmail('user@example.com', 'https://example.com/reset');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Mail] Reset password link (MAIL_* not configured):',
        'https://example.com/reset',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sendRegistrationConfirmationEmail', () => {
    it('should send confirmation email when configured', async () => {
      await service.sendRegistrationConfirmationEmail('user@example.com', 'https://example.com/confirm');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Confirmá'),
        }),
      );
    });
  });

  describe('sendPaymentReminderEmail', () => {
    it('should send payment reminder email when configured', async () => {
      await service.sendPaymentReminderEmail('customer@example.com', 'John Doe', 'INV-001', 100000, 'PYG');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Recordatorio'),
        }),
      );
    });
  });

  describe('sendSetPasswordEmail', () => {
    it('should send set password email when configured', async () => {
      await service.sendSetPasswordEmail('user@example.com', 'https://example.com/set-password');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Creá'),
        }),
      );
    });
  });
});
