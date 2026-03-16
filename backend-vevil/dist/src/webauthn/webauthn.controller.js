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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
const webauthn_service_1 = require("./webauthn.service");
let WebAuthnController = class WebAuthnController {
    constructor(webauthnService) {
        this.webauthnService = webauthnService;
    }
    getRegisterOptions(user) {
        return this.webauthnService.getRegistrationOptions(user.id);
    }
    async verifyRegister(user, body) {
        return this.webauthnService.verifyRegistration(user.id, body.response, body.challenge);
    }
    getLoginOptions(body) {
        if (!body?.email?.trim())
            throw new common_1.BadRequestException('email es requerido');
        return this.webauthnService.getAuthenticationOptions(body.email.trim().toLowerCase());
    }
    async verifyLogin(body) {
        if (!body?.response || !body?.challenge)
            throw new common_1.BadRequestException('response y challenge son requeridos');
        const tokens = await this.webauthnService.verifyAuthentication(body.response, body.challenge);
        if (!tokens)
            throw new common_1.BadRequestException('Verificación fallida');
        return tokens;
    }
};
exports.WebAuthnController = WebAuthnController;
__decorate([
    (0, common_1.Post)('register/options'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener opciones para registrar huella/passkey (requiere sesión)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Opciones para navigator.credentials.create()' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WebAuthnController.prototype, "getRegisterOptions", null);
__decorate([
    (0, common_1.Post)('register/verify'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar y guardar la credencial de huella registrada' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credencial guardada' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], WebAuthnController.prototype, "verifyRegister", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login/options'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener opciones para login con huella (pasar email)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Opciones para navigator.credentials.get()' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebAuthnController.prototype, "getLoginOptions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar huella y devolver tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens JWT' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebAuthnController.prototype, "verifyLogin", null);
exports.WebAuthnController = WebAuthnController = __decorate([
    (0, common_1.Controller)('auth/webauthn'),
    (0, swagger_1.ApiTags)('WebAuthn'),
    __metadata("design:paramtypes", [webauthn_service_1.WebAuthnService])
], WebAuthnController);
//# sourceMappingURL=webauthn.controller.js.map