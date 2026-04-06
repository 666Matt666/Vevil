"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const pending_registration_entity_1 = require("./pending-registration.entity");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../mail/mail.service");
const config_1 = require("@nestjs/config");
const CONFIRMATION_EXPIRES_HOURS = 24;
let PendingRegistrationsService = class PendingRegistrationsService {
    constructor(repo, usersService, mailService, configService) {
        this.repo = repo;
        this.usersService = usersService;
        this.mailService = mailService;
        this.configService = configService;
    }
    async createRequest(data) {
        const email = data.email.trim().toLowerCase();
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Ya existe una cuenta con ese correo.');
        }
        const existing = await this.repo.findOne({ where: { email } });
        if (existing) {
            if (existing.status === 'pending_email') {
                const token = crypto.randomBytes(32).toString('hex');
                const expires = new Date(Date.now() + CONFIRMATION_EXPIRES_HOURS * 60 * 60 * 1000);
                await this.repo.update(existing.id, {
                    emailConfirmationToken: token,
                    emailConfirmationExpires: expires,
                    name: data.name,
                    lastName: data.lastName ?? existing.lastName,
                    gender: data.gender ?? existing.gender,
                });
                await this.sendConfirmationEmail(email, token);
                return { message: 'Si ya solicitaste el registro, te enviamos de nuevo el correo de confirmación.' };
            }
            if (existing.status === 'pending_approval') {
                return { message: 'Ya tienes una solicitud en revisión. Un administrador la aprobará pronto.' };
            }
            if (existing.status === 'rejected') {
                throw new common_1.BadRequestException('Tu solicitud fue rechazada. Contacta al administrador si querés intentar de nuevo.');
            }
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + CONFIRMATION_EXPIRES_HOURS * 60 * 60 * 1000);
        await this.repo.save(this.repo.create({
            email,
            name: data.name,
            lastName: data.lastName,
            gender: data.gender,
            emailConfirmationToken: token,
            emailConfirmationExpires: expires,
            status: 'pending_email',
        }));
        await this.sendConfirmationEmail(email, token);
        return { message: 'Revisá tu correo y hacé clic en el enlace para confirmar tu solicitud de registro.' };
    }
    async sendConfirmationEmail(email, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const link = `${frontendUrl.replace(/\/$/, '')}/confirm-registration?token=${token}`;
        await this.mailService.sendRegistrationConfirmationEmail(email, link);
    }
    async confirmEmail(token) {
        const pending = await this.repo.findOne({
            where: { emailConfirmationToken: token, status: 'pending_email' },
        });
        if (!pending) {
            throw new common_1.BadRequestException('El enlace no es válido o ya fue utilizado.');
        }
        if (pending.emailConfirmationExpires && new Date() > pending.emailConfirmationExpires) {
            throw new common_1.BadRequestException('El enlace expiró. Solicitá el registro de nuevo.');
        }
        await this.repo.update(pending.id, {
            status: 'pending_approval',
            emailConfirmedAt: new Date(),
            emailConfirmationToken: undefined,
            emailConfirmationExpires: undefined,
        });
        return { message: 'Tu correo fue confirmado. Un administrador revisará tu solicitud y te enviará un correo para crear tu contraseña.' };
    }
    async findAllPending() {
        return this.repo.find({
            where: { status: 'pending_approval' },
            order: { createdAt: 'ASC' },
        });
    }
    async countPending() {
        return this.repo.count({ where: { status: 'pending_approval' } });
    }
    async approve(id, role) {
        const pending = await this.repo.findOne({ where: { id, status: 'pending_approval' } });
        if (!pending) {
            throw new common_1.NotFoundException('Solicitud no encontrada o ya fue procesada.');
        }
        const tempPassword = crypto.randomBytes(16).toString('hex');
        await this.usersService.create({
            email: pending.email,
            name: pending.name,
            lastName: pending.lastName,
            gender: pending.gender,
            password: tempPassword,
            role,
        }, role);
        const setPasswordToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.usersService.setResetPasswordToken(pending.email, setPasswordToken, expires);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const setPasswordLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${setPasswordToken}`;
        await this.mailService.sendSetPasswordEmail(pending.email, setPasswordLink);
        await this.repo.update(id, { status: 'approved' });
        return { message: 'Usuario aprobado. Se envió un correo para que cree su contraseña.' };
    }
    async reject(id) {
        const pending = await this.repo.findOne({ where: { id, status: 'pending_approval' } });
        if (!pending) {
            throw new common_1.NotFoundException('Solicitud no encontrada o ya fue procesada.');
        }
        await this.repo.update(id, { status: 'rejected' });
        return { message: 'Solicitud rechazada.' };
    }
};
exports.PendingRegistrationsService = PendingRegistrationsService;
exports.PendingRegistrationsService = PendingRegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pending_registration_entity_1.PendingRegistration)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, users_service_1.UsersService,
        mail_service_1.MailService, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], PendingRegistrationsService);
//# sourceMappingURL=pending-registrations.service.js.map