"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../products/product.entity");
const customer_entity_1 = require("../customers/customer.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const export_controller_1 = require("./export.controller");
const excel_export_service_1 = require("./excel-export.service");
let ExportModule = class ExportModule {
};
exports.ExportModule = ExportModule;
exports.ExportModule = ExportModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, customer_entity_1.Customer, invoice_entity_1.Invoice, audit_log_entity_1.AuditLog])],
        controllers: [export_controller_1.ExportController],
        providers: [excel_export_service_1.ExcelExportService],
        exports: [],
    })
], ExportModule);
//# sourceMappingURL=export.module.js.map