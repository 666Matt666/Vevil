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

        // Si no hay configuración, usar un transport que no falle (para desarrollo)
        if (!host) {
          return {
            transport: {
              jsonTransport: true, // Solo guarda el mensaje en memoria/log, no envía
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
