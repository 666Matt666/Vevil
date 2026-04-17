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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("../audit/audit.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_invoice_status_dto_1 = require("./dto/update-invoice-status.dto");
const update_invoice_dto_1 = require("./dto/update-invoice.dto");
const invoice_entity_1 = require("./invoice.entity");
const invoices_service_1 = require("./invoices.service");
const payment_entity_1 = require("./payment.entity");
let InvoicesController = class InvoicesController {
    constructor(invoicesService, auditService) {
        this.invoicesService = invoicesService;
        this.auditService = auditService;
    }
    userFromReq(req) {
        const u = req?.user;
        return { userId: u?.userId ?? u?.id ?? null, userEmail: u?.email ?? u?.username ?? null };
    }
    async create(createInvoiceDto, req) {
        const created = await this.invoicesService.create(createInvoiceDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.created',
            entityType: 'invoice',
            entityId: String(created.id),
            newValue: { total: created.total, status: created.status, customerId: created.customerId },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return created;
    }
    async findAll(pageStr, limitStr, search, customerIdStr, status, dateFrom, dateTo) {
        const page = pageStr != null ? parseInt(pageStr, 10) : NaN;
        const limit = limitStr != null ? parseInt(limitStr, 10) : NaN;
        const customerId = customerIdStr != null ? parseInt(customerIdStr, 10) : undefined;
        if (Number.isFinite(page) && Number.isFinite(limit)) {
            return this.invoicesService.findPage(page, limit, {
                search,
                customerId: Number.isFinite(customerId) ? customerId : undefined,
                status,
                dateFrom,
                dateTo,
            });
        }
        return this.invoicesService.findAll();
    }
    async updateStatus(id, dto, req) {
        const previous = await this.invoicesService.findOne(+id);
        const updated = await this.invoicesService.updateStatus(+id, dto.status);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.status_updated',
            entityType: 'invoice',
            entityId: id,
            oldValue: { status: previous.status },
            newValue: { status: updated.status },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return updated;
    }
    getPayments(id) {
        return this.invoicesService.getPayments(+id);
    }
    async addPayment(id, dto, req) {
        const payment = await this.invoicesService.addPayment(+id, dto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.payment_added',
            entityType: 'invoice',
            entityId: id,
            newValue: { paymentId: payment.id, amount: dto.amount },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return payment;
    }
    async deletePayment(invoiceId, paymentId, req) {
        const payment = await this.invoicesService.deletePayment(+paymentId, +invoiceId);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.payment_deleted',
            entityType: 'invoice',
            entityId: invoiceId,
            oldValue: { paymentId: payment.id, amount: payment.amount },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return { success: true };
    }
    findOne(id) {
        return this.invoicesService.findOne(+id);
    }
    async sendReminder(id, req) {
        const result = await this.invoicesService.sendReminder(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.reminder_sent',
            entityType: 'invoice',
            entityId: id,
            newValue: result,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return result;
    }
    async update(id, dto, req) {
        const previous = await this.invoicesService.findOne(+id);
        const updated = await this.invoicesService.update(+id, dto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.updated',
            entityType: 'invoice',
            entityId: id,
            oldValue: { total: previous.total, status: previous.status, customerId: previous.customerId },
            newValue: { total: updated.total, status: updated.status, customerId: updated.customerId },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return updated;
    }
    async remove(id, req) {
        const invoice = await this.invoicesService.findOne(+id);
        await this.invoicesService.remove(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.deleted',
            entityType: 'invoice',
            entityId: id,
            oldValue: { id: invoice.id, total: invoice.total, status: invoice.status },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return { success: true };
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva factura (con transacción y stock)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Factura creada exitosamente', type: invoice_entity_1.Invoice }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de facturas (con paginación y filtros)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de facturas obtenida exitosamente', type: [invoice_entity_1.Invoice] }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('dateFrom')),
    __param(6, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar el estado de una factura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado actualizado', type: invoice_entity_1.Invoice }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_status_dto_1.UpdateInvoiceStatusDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener pagos de una factura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de pagos', type: [payment_entity_1.Payment] }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar un pago a una factura' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pago creado', type: payment_entity_1.Payment }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Delete)(':invoiceId/payments/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un pago de una factura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pago eliminado' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('invoiceId')),
    __param(1, (0, common_1.Param)('paymentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una factura por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Factura encontrada', type: invoice_entity_1.Invoice }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Factura no encontrada' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/send-reminder'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar recordatorio de pago por email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado del envío' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendReminder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una factura (solo pendiente/cancelada)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Factura actualizada', type: invoice_entity_1.Invoice }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No se puede editar factura pagada' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_dto_1.UpdateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una factura (solo pendiente/cancelada)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Factura eliminada' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No se puede eliminar factura pagada o con pagos' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "remove", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        audit_service_1.AuditService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map