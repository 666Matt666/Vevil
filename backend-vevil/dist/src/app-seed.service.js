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
exports.AppSeedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("./users/users.service");
const user_entity_1 = require("./users/user.entity");
const user_role_enum_1 = require("./users/entities/user-role.enum");
const E2E_ADMIN_EMAIL = 'admin@vevil.com';
const E2E_ADMIN_PASSWORD = 'admin123';
const E2E_ADMIN_NAME = 'Admin E2E';
let AppSeedService = class AppSeedService {
    constructor(usersService, configService, userRepo) {
        this.usersService = usersService;
        this.configService = configService;
        this.userRepo = userRepo;
    }
    async onApplicationBootstrap() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const forceSeed = this.configService.get('SEED_E2E_ADMIN') === 'true';
        const port = String(process.env.PORT ?? this.configService.get('PORT') ?? '');
        const isE2E = port === '3001';
        if (isProduction && !forceSeed && !isE2E)
            return;
        if (isE2E && process.env.NODE_ENV !== 'production') {
            console.log('[Vevil] Seed E2E: ejecutando (PORT=3001)');
        }
        const existing = await this.usersService.findOneByEmail(E2E_ADMIN_EMAIL).catch(() => undefined);
        if (existing) {
            const roleStr = String(existing.role ?? '').toLowerCase();
            try {
                await this.userRepo.update({ id: existing.id }, { role: user_role_enum_1.UserRole.ADMIN });
                if (roleStr !== 'admin' && process.env.NODE_ENV !== 'production') {
                    console.log('[Vevil] Usuario E2E admin actualizado a rol admin: admin@vevil.com');
                }
            }
            catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[Vevil] No se pudo actualizar rol admin E2E:', e?.message ?? e);
                }
            }
            return;
        }
        try {
            await this.usersService.create({
                email: E2E_ADMIN_EMAIL,
                name: E2E_ADMIN_NAME,
                password: E2E_ADMIN_PASSWORD,
            }, user_role_enum_1.UserRole.ADMIN);
            if (process.env.NODE_ENV !== 'production') {
                console.log('[Vevil] Usuario E2E admin creado: admin@vevil.com');
            }
        }
        catch (e) {
            if (e?.code !== '23505' && e?.message !== 'Email already exists') {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[Vevil] No se pudo crear admin E2E:', e?.message ?? e);
                }
            }
        }
    }
};
exports.AppSeedService = AppSeedService;
exports.AppSeedService = AppSeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService,
        typeorm_2.Repository])
], AppSeedService);
//# sourceMappingURL=app-seed.service.js.map