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
const invoices_service_1 = require("./invoices.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const update_invoice_status_dto_1 = require("./dto/update-invoice-status.dto");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const audit_service_1 = require("../audit/audit.service");
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
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
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
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_invoice_status_dto_1.UpdateInvoiceStatusDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/send-reminder'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendReminder", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        audit_service_1.AuditService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map