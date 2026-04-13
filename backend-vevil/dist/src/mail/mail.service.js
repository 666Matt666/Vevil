"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let MailService = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.resend = null;
        const resendKey = this.configService.get('RESEND_API_KEY');
        if (resendKey && resendKey.trim().length > 0) {
            this.resend = new resend_1.Resend(resendKey);
        }
    }
    isConfigured() {
        const resendKey = this.configService.get('RESEND_API_KEY');
        const hasResendKey = !!resendKey && resendKey.trim().length > 0;
        console.log('[MailService] isConfigured check - RESEND_API_KEY:', hasResendKey ? 'SET' : 'NOT SET');
        return hasResendKey;
    }
    getFromAddress() {
        return 'onboarding@resend.dev';
    }
    getBccAddress() {
        return 'mdibella@gmail.com';
    }
    async sendResetPasswordEmail(to, resetLink) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Reset password link (RESEND not configured):', resetLink);
            }
            return;
        }
        console.log('[Mail] Sending reset email to:', to);
        await this.resend.emails.send({
            from: this.getFromAddress(),
            to,
            bcc: this.getBccAddress(),
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
    async sendRegistrationConfirmationEmail(to, confirmationLink) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Confirm registration link:', confirmationLink);
            }
            return;
        }
        await this.resend.emails.send({
            from: this.getFromAddress(),
            to,
            bcc: this.getBccAddress(),
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
    async sendPaymentReminderEmail(to, customerName, invoiceNumber, total, currency) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Payment reminder (RESEND not configured):', { to, invoiceNumber, total });
            }
            return;
        }
        const totalStr = `${currency} ${Number(total).toLocaleString('es-PY', { minimumFractionDigits: 0 })}`;
        console.log('[Mail] Sending payment reminder to:', to, 'from:', this.getFromAddress(), 'bcc:', this.getBccAddress());
        await this.resend.emails.send({
            from: this.getFromAddress(),
            to,
            bcc: this.getBccAddress(),
            subject: `Recordatorio de pago - Factura ${invoiceNumber} - Vevil`,
            html: `
        <p>Hola ${customerName || 'cliente'},</p>
        <p>Te recordamos que tenés una factura pendiente de pago:</p>
        <p><strong>Factura ${invoiceNumber}</strong> - Total: ${totalStr}</p>
        <p>Por favor, acercate a realizar el pago o contactanos para coordinar.</p>
        <p>Saludos,<br/>El equipo de Vevil</p>
      `,
        });
    }
    async sendSetPasswordEmail(to, setPasswordLink) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Set password link:', setPasswordLink);
            }
            return;
        }
        await this.resend.emails.send({
            from: this.getFromAddress(),
            to,
            bcc: this.getBccAddress(),
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
    async sendInvoiceEmail(to, customerName, invoiceNumber, total, currency, items, invoicePdfBase64) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Invoice email (RESEND not configured):', { to, invoiceNumber, total });
            }
            return;
        }
        const totalStr = `${currency} ${Number(total).toLocaleString('es-PY', { minimumFractionDigits: 0 })}`;
        const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${currency} ${Number(item.price).toLocaleString('es-PY')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${currency} ${Number(item.total).toLocaleString('es-PY')}</td>
      </tr>
    `).join('');
        const attachments = invoicePdfBase64
            ? [{ filename: `factura_${invoiceNumber}.pdf`, content: invoicePdfBase64 }]
            : undefined;
        console.log('[Mail] Sending invoice to:', to);
        await this.resend.emails.send({
            from: this.getFromAddress(),
            to,
            bcc: this.getBccAddress(),
            subject: `Factura ${invoiceNumber} - Vevil`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Factura ${invoiceNumber}</h2>
          <p>Hola${customerName ? ` ${customerName}` : ''},</p>
          <p>Adjuntamos tu factura por un total de <strong>${totalStr}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Producto</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Cant.</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Precio</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <p style="text-align: right; font-size: 18px;"><strong>Total: ${totalStr}</strong></p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            Si tenés alguna consulta sobre esta factura, contactanos.<br/>
            Saludos,<br/>El equipo de Vevil
          </p>
        </div>
      `,
            attachments,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map