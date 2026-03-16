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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async list(userId, entityType, entityId, limitStr) {
        const limit = Math.min(Math.max(parseInt(limitStr || '50', 10) || 50, 1), 200);
        if (userId) {
            return this.auditService.findByUser(userId, limit);
        }
        if (entityType && entityId) {
            return this.auditService.findByEntity(entityType, entityId, limit);
        }
        return this.auditService.findRecent(limit);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar registros de auditoría' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Tipo de entidad (invoice, customer, product, etc.)' }),
    (0, swagger_1.ApiQuery)({ name: 'entityId', required: false, description: 'ID de la entidad' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Máximo de resultados (1-200, default 50)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de registros de auditoría' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('entityId')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "list", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiTags)('Auditoría'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map