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
exports.JwtRefreshStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("../auth.controller");
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    constructor(configService) {
        super({
            jwtFromRequest: (req) => {
                const authHeader = req?.headers?.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    return authHeader.substring(7);
                }
                if (req && req.cookies && req.cookies[auth_controller_1.REFRESH_TOKEN_COOKIE]) {
                    return req.cookies[auth_controller_1.REFRESH_TOKEN_COOKIE];
                }
                return req.body?.refresh_token;
            },
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
        this.configService = configService;
    }
    validate(req, payload) {
        const refreshToken = req.headers?.authorization?.substring(7) ||
            req.cookies?.[auth_controller_1.REFRESH_TOKEN_COOKIE] ||
            req.body?.refresh_token;
        return { ...payload, refreshToken };
    }
};
exports.JwtRefreshStrategy = JwtRefreshStrategy;
exports.JwtRefreshStrategy = JwtRefreshStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtRefreshStrategy);
//# sourceMappingURL=jwt-refresh.strategy.js.map