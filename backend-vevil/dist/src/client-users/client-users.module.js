"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const client_auth_controller_1 = require("./client-auth.controller");
const client_users_service_1 = require("./client-users.service");
const client_user_entity_1 = require("./client-user.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
let ClientUsersModule = class ClientUsersModule {
};
exports.ClientUsersModule = ClientUsersModule;
exports.ClientUsersModule = ClientUsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([client_user_entity_1.ClientUser, invoice_entity_1.Invoice])],
        controllers: [client_auth_controller_1.ClientAuthController],
        providers: [client_users_service_1.ClientUsersService],
        exports: [client_users_service_1.ClientUsersService],
    })
], ClientUsersModule);
//# sourceMappingURL=client-users.module.js.map