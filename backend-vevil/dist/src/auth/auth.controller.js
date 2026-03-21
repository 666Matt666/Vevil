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
exports.AuthController = exports.COOKIE_MAX_AGE = exports.REFRESH_TOKEN_COOKIE = exports.ACCESS_TOKEN_COOKIE = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const get_user_decorator_1 = require("./decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
const jwt_refresh_guard_1 = require("./guards/jwt-refresh.guard");
const public_decorator_1 = require("./decorators/public.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const login_dto_1 = require("./dto/login.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const request_registration_dto_1 = require("./dto/request-registration.dto");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const pending_registrations_service_1 = require("../pending-registrations/pending-registrations.service");
const users_service_1 = require("../users/users.service");
const audit_service_1 = require("../audit/audit.service");
exports.ACCESS_TOKEN_COOKIE = 'vevil_access_token';
exports.REFRESH_TOKEN_COOKIE = 'vevil_refresh_token';
exports.COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
let AuthController = class AuthController {
    constructor(authService, pendingRegistrationsService, usersService, auditService) {
        this.authService = authService;
        this.pendingRegistrationsService = pendingRegistrationsService;
        this.usersService = usersService;
        this.auditService = auditService;
    }
    setTokenCookies(res, accessToken, refreshToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie(exports.ACCESS_TOKEN_COOKIE, accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.cookie(exports.REFRESH_TOKEN_COOKIE, refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: exports.COOKIE_MAX_AGE,
            path: '/',
        });
    }
    clearTokenCookies(res) {
        res.clearCookie(exports.ACCESS_TOKEN_COOKIE, { path: '/' });
        res.clearCookie(exports.REFRESH_TOKEN_COOKIE, { path: '/' });
    }
    async login(user, _loginDto, req, res) {
        const result = await this.authService.login(user);
        this.setTokenCookies(res, result.access_token, result.refresh_token);
        await this.auditService.log({
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
            action: 'auth.login',
            entityType: 'auth',
            entityId: user?.id ?? '',
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return res.json({
            user: result.user,
        });
    }
    async requestRegistration(dto) {
        return this.pendingRegistrationsService.createRequest(dto);
    }
    async confirmRegistration(token) {
        if (!token)
            throw new common_1.BadRequestException('Falta el token.');
        return this.pendingRegistrationsService.confirmEmail(token);
    }
    async register(createUserDto) {
        return this.authService.register(createUserDto);
    }
    async getProfile(user) {
        const id = user.id ?? user.userId;
        const full = await this.usersService.findOne(id);
        const { password, hashedRefreshToken, resetPasswordToken, resetPasswordExpires, ...profile } = full;
        return { ...profile, role: full.role != null ? String(full.role) : undefined };
    }
    async logout(user, res) {
        const userId = user.id ?? user.userId;
        await this.authService.logout(userId);
        this.clearTokenCookies(res);
        return res.json({ message: 'Sesión cerrada correctamente' });
    }
    async refreshTokens(user, res) {
        const result = await this.authService.refreshTokens(user.id, user.refreshToken);
        this.setTokenCookies(res, result.access_token, result.refresh_token);
        return res.json({
            user: result.user,
        });
    }
    async forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60_000 } }),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('local')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión de usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login exitoso, establece cookies HttpOnly.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciales inválidas.' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60_000 } }),
    (0, common_1.Post)('request-registration'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar registro (envía email para confirmar correo)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Se envió un correo para confirmar.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El email ya existe.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_registration_dto_1.RequestRegistrationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestRegistration", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60_000 } }),
    (0, common_1.Get)('confirm-registration'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar correo desde el link del email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Correo confirmado, pendiente de aprobación de un admin.' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmRegistration", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60_000 } }),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar un nuevo usuario (registro directo, sin aprobación)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuario registrado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El email ya existe.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el perfil del usuario actual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil del usuario.', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión del usuario' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refrescar tokens de autenticación' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ short: { limit: 3, ttl: 60_000 } }),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar restablecimiento de contraseña' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restablecer contraseña con token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, swagger_1.ApiTags)('Authentication'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        pending_registrations_service_1.PendingRegistrationsService,
        users_service_1.UsersService,
        audit_service_1.AuditService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map