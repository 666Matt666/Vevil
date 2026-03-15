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

  /**
   * Envía el email para confirmar la solicitud de registro (link/botón).
   */
  async sendRegistrationConfirmationEmail(to: string, confirmationLink: string): Promise<void> {
    if (!this.isConfigured()) {
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log('[Mail] Confirm registration link:', confirmationLink);
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
      subject: 'Confirmá tu solicitud de registro - Vevil',
      html: `
        <p>Hola,</p>
        <p>Recibimos tu solicitud para registrarte en Vevil.</p>
        <p>Para confirmar que estás de acuerdo, hacé clic en el siguiente enlace (válido por 24 horas):</p>
        <p><a href="${confirmationLink}" style="display:inline-block; padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;">Confirmar mi registro</a></p>
        <p>O copiá este enlace en tu navegador:</p>
        <p><a href="${confirmationLink}">${confirmationLink}</a></p>
        <p>Si no solicitaste el registro, podés ignorar este correo.</p>
        <p>Saludos,<br/>El equipo de Vevil</p>
      `,
    });
  }

  /**
   * Envía el email para que el usuario cree su contraseña (tras aprobación de admin).
   */
  async sendSetPasswordEmail(to: string, setPasswordLink: string): Promise<void> {
    if (!this.isConfigured()) {
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log('[Mail] Set password link:', setPasswordLink);
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
      subject: 'Creá tu contraseña - Vevil',
      html: `
        <p>Hola,</p>
        <p>Tu solicitud de registro en Vevil fue aprobada.</p>
        <p>Hacé clic en el siguiente enlace para crear tu contraseña e ingresar (válido por 7 días):</p>
        <p><a href="${setPasswordLink}" style="display:inline-block; padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;">Crear mi contraseña</a></p>
        <p>O copiá este enlace en tu navegador:</p>
        <p><a href="${setPasswordLink}">${setPasswordLink}</a></p>
        <p>Saludos,<br/>El equipo de Vevil</p>
      `,
    });
  }
}
