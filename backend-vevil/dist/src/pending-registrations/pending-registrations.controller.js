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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
const user_role_enum_1 = require("../users/entities/user-role.enum");
const pending_registrations_service_1 = require("./pending-registrations.service");
const approve_registration_dto_1 = require("./dto/approve-registration.dto");
let PendingRegistrationsController = class PendingRegistrationsController {
    constructor(service) {
        this.service = service;
    }
    findAllPending() {
        return this.service.findAllPending();
    }
    async countPending() {
        const count = await this.service.countPending();
        return { count };
    }
    approve(id, dto, _user) {
        return this.service.approve(id, dto.role);
    }
    reject(id, _user) {
        return this.service.reject(id);
    }
};
exports.PendingRegistrationsController = PendingRegistrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar solicitudes pendientes de aprobación (solo Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], PendingRegistrationsController.prototype, "findAllPending", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Cantidad de solicitudes pendientes (para notificación)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Número de solicitudes pendientes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], PendingRegistrationsController.prototype, "countPending", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprobar solicitud y asignar perfil (solo Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario aprobado, se envió email para crear contraseña.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Solicitud no encontrada.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_registration_dto_1.ApproveRegistrationDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PendingRegistrationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Rechazar solicitud (solo Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitud rechazada.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Solicitud no encontrada.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PendingRegistrationsController.prototype, "reject", null);
exports.PendingRegistrationsController = PendingRegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('Pending Registrations'),
    (0, common_1.Controller)('pending-registrations'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [pending_registrations_service_1.PendingRegistrationsService])
], PendingRegistrationsController);
//# sourceMappingURL=pending-registrations.controller.js.map