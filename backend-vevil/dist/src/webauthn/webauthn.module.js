"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const webauthn_credential_entity_1 = require("./webauthn-credential.entity");
const webauthn_service_1 = require("./webauthn.service");
const webauthn_controller_1 = require("./webauthn.controller");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let WebAuthnModule = class WebAuthnModule {
};
exports.WebAuthnModule = WebAuthnModule;
exports.WebAuthnModule = WebAuthnModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([webauthn_credential_entity_1.WebAuthnCredential]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
        ],
        controllers: [webauthn_controller_1.WebAuthnController],
        providers: [webauthn_service_1.WebAuthnService],
        exports: [webauthn_service_1.WebAuthnService],
    })
], WebAuthnModule);
//# sourceMappingURL=webauthn.module.js.map