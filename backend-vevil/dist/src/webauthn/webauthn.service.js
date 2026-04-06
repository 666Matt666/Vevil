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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const server_1 = require("@simplewebauthn/server");
const webauthn_credential_entity_1 = require("./webauthn-credential.entity");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("../auth/auth.service");
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
let WebAuthnService = class WebAuthnService {
    constructor(credentialRepo, usersService, authService, configService) {
        this.credentialRepo = credentialRepo;
        this.usersService = usersService;
        this.authService = authService;
        this.configService = configService;
        this.challengeStore = new Map();
    }
    setChallenge(challenge, data) {
        this.challengeStore.set(challenge, { ...data, createdAt: Date.now() });
    }
    getAndConsumeChallenge(challenge, expectedType, expectedUserId) {
        const entry = this.challengeStore.get(challenge);
        if (!entry || entry.type !== expectedType)
            return null;
        if (Date.now() - entry.createdAt > CHALLENGE_TTL_MS) {
            this.challengeStore.delete(challenge);
            return null;
        }
        if (expectedType === 'registration' && expectedUserId && entry.userId !== expectedUserId)
            return null;
        this.challengeStore.delete(challenge);
        return entry;
    }
    getRpId() {
        const rpId = this.configService.get('WEBAUTHN_RP_ID');
        if (rpId)
            return rpId;
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        try {
            const u = new URL(frontendUrl);
            return u.hostname;
        }
        catch {
            return 'localhost';
        }
    }
    getOrigin() {
        const origin = this.configService.get('WEBAUTHN_ORIGIN');
        if (origin)
            return origin;
        return this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    }
    async getRegistrationOptions(userId) {
        const user = await this.usersService.findOne(userId);
        if (!user)
            throw new common_1.BadRequestException('Usuario no encontrado');
        const existing = await this.credentialRepo.find({ where: { userId } });
        const options = await (0, server_1.generateRegistrationOptions)({
            rpName: this.configService.get('WEBAUTHN_RP_NAME') || 'Vevil',
            rpID: this.getRpId(),
            userName: user.email,
            userID: Buffer.from(user.id, 'utf8').slice(0, 64),
            userDisplayName: user.name || user.email,
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
            excludeCredentials: existing.map((c) => ({
                id: c.credentialId,
            })),
        });
        this.setChallenge(options.challenge, { type: 'registration', userId });
        return options;
    }
    async verifyRegistration(userId, response, expectedChallenge) {
        const stored = this.getAndConsumeChallenge(expectedChallenge, 'registration', userId);
        if (!stored) {
            throw new common_1.BadRequestException('Challenge inválido, expirado o ya utilizado. Solicitá de nuevo las opciones para registrar huella.');
        }
        const origin = this.getOrigin();
        const rpID = this.getRpId();
        const verification = await (0, server_1.verifyRegistrationResponse)({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
        if (!verification.verified || !verification.registrationInfo) {
            return { verified: false };
        }
        const { credential, credentialDeviceType } = verification.registrationInfo;
        const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');
        await this.credentialRepo.save(this.credentialRepo.create({
            userId,
            credentialId: credential.id,
            publicKey: publicKeyBase64,
            counter: credential.counter ?? 0,
            deviceType: credentialDeviceType,
        }));
        return { verified: true };
    }
    async getAuthenticationOptions(email) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user)
            throw new common_1.BadRequestException('Usuario no encontrado');
        const credentials = await this.credentialRepo.find({ where: { userId: user.id } });
        const options = await (0, server_1.generateAuthenticationOptions)({
            rpID: this.getRpId(),
            allowCredentials: credentials.map((c) => ({ id: c.credentialId })),
            userVerification: 'preferred',
        });
        this.setChallenge(options.challenge, { type: 'auth', email: user.email });
        return options;
    }
    async verifyAuthentication(response, expectedChallenge) {
        const stored = this.getAndConsumeChallenge(expectedChallenge, 'auth');
        if (!stored) {
            throw new common_1.BadRequestException('Challenge inválido, expirado o ya utilizado. Volvé a solicitar iniciar sesión con huella.');
        }
        const credentialId = response.id;
        const credential = await this.credentialRepo.findOne({
            where: { credentialId },
            relations: ['user'],
        });
        if (!credential?.user)
            return null;
        const origin = this.getOrigin();
        const rpID = this.getRpId();
        const publicKeyBuffer = Buffer.from(credential.publicKey, 'base64');
        const verification = await (0, server_1.verifyAuthenticationResponse)({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: credential.credentialId,
                publicKey: publicKeyBuffer,
                counter: credential.counter,
            },
        });
        if (!verification.verified)
            return null;
        await this.credentialRepo.update({ id: credential.id }, { counter: verification.authenticationInfo.newCounter });
        const user = credential.user;
        const { password, hashedRefreshToken, ...safeUser } = user;
        return this.authService.login(safeUser);
    }
};
exports.WebAuthnService = WebAuthnService;
exports.WebAuthnService = WebAuthnService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webauthn_credential_entity_1.WebAuthnCredential)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, users_service_1.UsersService,
        auth_service_1.AuthService, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], WebAuthnService);
//# sourceMappingURL=webauthn.service.js.map