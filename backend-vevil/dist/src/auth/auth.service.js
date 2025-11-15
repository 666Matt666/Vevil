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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../users/user.entity");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { username: user.email, sub: user.id, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        await this.updateRefreshToken(user.id, refreshToken);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersService.update(userId, {
            hashedRefreshToken,
        });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findOne(userId);
        if (!user || !user.hashedRefreshToken) {
            throw new common_1.UnauthorizedException('Acceso denegado');
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!refreshTokenMatches)
            throw new common_1.UnauthorizedException('Acceso denegado');
        const userPayloadForLogin = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        return this.login(userPayloadForLogin);
    }
    async logout(userId) {
        await this.usersService.update(userId, { hashedRefreshToken: null });
    }
    async register(registerDto) {
        const { email, name } = registerDto;
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está en uso');
        }
        const userCount = await this.usersService.count();
        const isFirstUser = userCount === 0;
        const newUser = await this.usersService.create({
            ...registerDto,
            role: isFirstUser ? user_entity_1.UserRole.ADMIN : user_entity_1.UserRole.USER,
        });
        const { password: _, ...result } = newUser;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map