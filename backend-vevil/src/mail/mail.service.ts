import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Indica si el envío de emails está configurado (hay al menos MAIL_HOST).
   */
  isConfigured(): boolean {
    return !!this.configService.get<string>('MAIL_HOST');
  }

  /**
   * Envía el email con el enlace para restablecer la contraseña.
   * No hace nada si MAIL_* no está configurado (evita errores en desarrollo sin SMTP).
   */
  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    if (!this.isConfigured()) {
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        // En desarrollo, loguear el enlace para poder probar sin configurar SMTP
        console.log('[Mail] Reset password link (MAIL_* not configured):', resetLink);
      }
      return;
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('MAIL_USER') ||
      'noreply@vevil.com';

    await this.mailerService.sendMail({
      to,
      from,
      subject: 'Restablecer tu contraseña - Vevil',
      html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Vevil.</p>
        <p>Hacé clic en el siguiente enlace para elegir una nueva contraseña (válido por 1 hora):</p>
        <p><a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a></p>
        <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
        <p>Saludos,<br/>El equipo de Vevil</p>
      `,
    });
  }
}
