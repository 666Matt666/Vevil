"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_seed_service_1 = require("./app-seed.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const customers_module_1 = require("./customers/customers.module");
const invoices_module_1 = require("./invoices/invoices.module");
const metrics_module_1 = require("./metrics/metrics.module");
const stock_movements_module_1 = require("./stock-movements/stock-movements.module");
const mail_module_1 = require("./mail/mail.module");
const pending_registrations_module_1 = require("./pending-registrations/pending-registrations.module");
const webauthn_module_1 = require("./webauthn/webauthn.module");
const audit_module_1 = require("./audit/audit.module");
const user_entity_1 = require("./users/user.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
                validationSchema: null,
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 60000, limit: 100 },
            ]),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const dbHost = configService.get('DB_HOST') || 'localhost';
                    const dbPort = configService.get('DB_PORT') || 5432;
                    const dbUsername = configService.get('DB_USERNAME') || 'postgres';
                    const dbPassword = configService.get('DB_PASSWORD') || 'admin';
                    const dbDatabase = configService.get('DB_DATABASE') || 'vevil_db';
                    const isUsingDefaultValues = dbHost === 'localhost' && dbPassword === 'admin' && dbDatabase === 'vevil_db';
                    const isProduction = (process.env.NODE_ENV === 'production' || dbHost.includes('supabase.co')) && !isUsingDefaultValues;
                    if (isProduction) {
                        const requiredVars = {
                            DB_HOST: dbHost,
                            DB_USERNAME: dbUsername,
                            DB_PASSWORD: dbPassword,
                            DB_DATABASE: dbDatabase,
                        };
                        const missingVars = Object.entries(requiredVars)
                            .filter(([key, value]) => !value || value === 'localhost' || value === 'admin')
                            .map(([key]) => key);
                        if (missingVars.length > 0) {
                            console.error('❌ ERROR: Variables de entorno faltantes o inválidas en producción:');
                            missingVars.forEach(varName => console.error(`   - ${varName}`));
                            console.error('💡 Configura estas variables en tu plataforma de despliegue (Render)');
                            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
                        }
                    }
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('📊 Configuración de Base de Datos:');
                        console.log(`   Host: ${dbHost}`);
                        console.log(`   Port: ${dbPort}`);
                        console.log(`   Username: ${dbUsername}`);
                        console.log(`   Database: ${dbDatabase}`);
                        console.log(`   SSL: ${dbHost.includes('supabase.co') ? 'Sí (Supabase)' : 'No (Local)'}`);
                    }
                    return {
                        type: 'postgres',
                        host: dbHost,
                        port: dbPort,
                        username: dbUsername,
                        password: dbPassword,
                        database: dbDatabase,
                        autoLoadEntities: true,
                        synchronize: process.env.NODE_ENV !== 'production' && !dbHost.includes('supabase.co'),
                        ssl: dbHost.includes('supabase.co') ? {
                            rejectUnauthorized: false
                        } : false,
                        retryAttempts: 3,
                        retryDelay: 3000,
                        logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'migration'] : ['error'],
                    };
                },
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            invoices_module_1.InvoicesModule,
            metrics_module_1.MetricsModule,
            stock_movements_module_1.StockMovementsModule,
            mail_module_1.MailModule,
            pending_registrations_module_1.PendingRegistrationsModule,
            webauthn_module_1.WebAuthnModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            app_seed_service_1.AppSeedService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map