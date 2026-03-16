"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRegistrationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pending_registration_entity_1 = require("./pending-registration.entity");
const pending_registrations_service_1 = require("./pending-registrations.service");
const pending_registrations_controller_1 = require("./pending-registrations.controller");
const users_module_1 = require("../users/users.module");
const mail_module_1 = require("../mail/mail.module");
let PendingRegistrationsModule = class PendingRegistrationsModule {
};
exports.PendingRegistrationsModule = PendingRegistrationsModule;
exports.PendingRegistrationsModule = PendingRegistrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pending_registration_entity_1.PendingRegistration]),
            users_module_1.UsersModule,
            mail_module_1.MailModule,
        ],
        controllers: [pending_registrations_controller_1.PendingRegistrationsController],
        providers: [pending_registrations_service_1.PendingRegistrationsService],
        exports: [pending_registrations_service_1.PendingRegistrationsService],
    })
], PendingRegistrationsModule);
//# sourceMappingURL=pending-registrations.module.js.map