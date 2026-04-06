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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevOrJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let DevOrJwtGuard = class DevOrJwtGuard {
    constructor(jwtGuard) {
        this.jwtGuard = jwtGuard;
    }
    async canActivate(context) {
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
        return this.jwtGuard.canActivate(context);
    }
    handleRequest(err, user, info) {
        if (process.env.NODE_ENV === 'development') {
            return { userId: '11111111-1111-1111-1111-111111111111', email: 'test@test.com', role: 'admin', name: 'Test User' };
        }
        return this.jwtGuard.handleRequest(err, user, info);
    }
};
exports.DevOrJwtGuard = DevOrJwtGuard;
exports.DevOrJwtGuard = DevOrJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => (0, passport_1.AuthGuard)('jwt')))),
    __metadata("design:paramtypes", [typeof (_a = typeof passport_1.AuthGuard !== "undefined" && passport_1.AuthGuard) === "function" ? _a : Object])
], DevOrJwtGuard);
//# sourceMappingURL=dev-or-jwt.guard.js.map