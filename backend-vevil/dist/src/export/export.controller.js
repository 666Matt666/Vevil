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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
const customer_entity_1 = require("../customers/customer.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const dev_jwt_auth_guard_1 = require("../auth/guards/dev-jwt-auth.guard");
const excel_export_service_1 = require("./excel-export.service");
let ExportController = class ExportController {
    constructor(productsRepo, customersRepo, invoicesRepo, auditRepo, excelExportService) {
        this.productsRepo = productsRepo;
        this.customersRepo = customersRepo;
        this.invoicesRepo = invoicesRepo;
        this.auditRepo = auditRepo;
        this.excelExportService = excelExportService;
    }
    async exportJson() {
        const [products, customers, invoices, auditLogs] = await Promise.all([
            this.productsRepo.find({ relations: ['invoiceItems'] }),
            this.customersRepo.find(),
            this.invoicesRepo.find({ relations: ['items', 'customer', 'payments'] }),
            this.auditRepo.find({
                order: { createdAt: 'DESC' },
                take: 10000,
            }),
        ]);
        return {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            products,
            customers,
            invoices,
            auditLogs,
        };
    }
    async exportExcel(res) {
        try {
            const [products, customers, invoices, auditLogs] = await Promise.all([
                this.productsRepo.find({ relations: ['invoiceItems'] }),
                this.customersRepo.find(),
                this.invoicesRepo.find({ relations: ['items', 'customer', 'payments'] }),
                this.auditRepo.find({
                    order: { createdAt: 'DESC' },
                    take: 10000,
                }),
            ]);
            const data = {
                products,
                customers,
                invoices,
                auditLogs,
            };
            const buffer = await this.excelExportService.generateExcelBuffer(data);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const filename = `vevil-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        }
        catch (error) {
            console.error('Error generating Excel:', error);
            res.status(500).json({ error: 'Error al generar archivo Excel' });
        }
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportJson", null);
__decorate([
    (0, common_1.Get)('excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportExcel", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(dev_jwt_auth_guard_1.DevJwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(4, (0, common_1.Inject)(excel_export_service_1.ExcelExportService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        excel_export_service_1.ExcelExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map