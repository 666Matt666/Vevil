"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const mail_service_1 = require("./mail.service");
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const host = configService.get('MAIL_HOST');
                    const port = configService.get('MAIL_PORT') || 587;
                    const user = configService.get('MAIL_USER');
                    const pass = configService.get('MAIL_PASSWORD');
                    const secure = configService.get('MAIL_SECURE') === 'true';
                    if (!host) {
                        return {
                            transport: {
                                jsonTransport: true,
                            },
                        };
                    }
                    return {
                        transport: {
                            host,
                            port,
                            secure,
                            auth: user && pass ? { user, pass } : undefined,
                        },
                        defaults: {
                            from: configService.get('MAIL_FROM') ||
                                user ||
                                'noreply@vevil.com',
                        },
                    };
                },
            }),
        ],
        providers: [mail_service_1.MailService],
        exports: [mail_service_1.MailService],
    })
], MailModule);
//# sourceMappingURL=mail.module.js.map