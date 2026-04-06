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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = class MailService {
    constructor(mailerService, configService) {
        this.mailerService = mailerService;
        this.configService = configService;
    }
    isConfigured() {
        return !!this.configService.get('MAIL_HOST');
    }
    getFromAddress() {
        const from = this.configService.get('MAIL_FROM') ||
            this.configService.get('MAIL_ADMIN_EMAIL') ||
            this.configService.get('MAIL_USER') ||
            'noreply@vevil.com';
        const name = this.configService.get('MAIL_ADMIN_NAME') || this.configService.get('MAIL_FROM_NAME');
        if (name && from) {
            return `${name} <${from}>`;
        }
        return from;
    }
    async sendResetPasswordEmail(to, resetLink) {
        if (!this.isConfigured()) {
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[Mail] Reset password link (MAIL_* not configured):', resetLink);
            }
            return;
        }
        await this.mailerService.sendMail({
            to,
            from: this.getFromAddress(),
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
        await this.mailerService.sendMail({
            to,
            from: this.getFromAddress(),
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
                console.log('[Mail] Payment reminder (MAIL_* not configured):', { to, invoiceNumber, total });
            }
            return;
        }
        const totalStr = `${currency} ${Number(total).toLocaleString('es-PY', { minimumFractionDigits: 0 })}`;
        await this.mailerService.sendMail({
            to,
            from: this.getFromAddress(),
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
        await this.mailerService.sendMail({
            to,
            from: this.getFromAddress(),
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
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof mailer_1.MailerService !== "undefined" && mailer_1.MailerService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], MailService);
//# sourceMappingURL=mail.service.js.map