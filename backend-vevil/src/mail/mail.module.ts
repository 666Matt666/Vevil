import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MAIL_HOST');
        const port = configService.get<number>('MAIL_PORT') || 587;
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASSWORD');
        const secure = configService.get<string>('MAIL_SECURE') === 'true';

        // Check for Resend API key first
        const resendKey = configService.get<string>('RESEND_API_KEY');
        
        if (resendKey && resendKey.trim().length > 0) {
          // Use Resend transport
          return {
            transport: {
              host: 'smtp.resend.com',
              port: 587,
              secure: false,
              auth: {
                user: 'resend',
                pass: resendKey,
              },
            },
            defaults: {
              from: configService.get<string>('MAIL_FROM') || 'onboarding@resend.dev',
            },
          };
        }

        // Fallback to regular SMTP or no-op
        if (!host || host.trim().length === 0) {
          return {
            transport: {
              jsonTransport: true,
            },
          };
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
          },
          defaults: {
            from:
              configService.get<string>('MAIL_FROM') ||
              user ||
              'noreply@vevil.com',
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
