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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
const customer_entity_1 = require("../customers/customer.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const dev_jwt_auth_guard_1 = require("../auth/guards/dev-jwt-auth.guard");
let ExportController = class ExportController {
    constructor(productsRepo, customersRepo, invoicesRepo) {
        this.productsRepo = productsRepo;
        this.customersRepo = customersRepo;
        this.invoicesRepo = invoicesRepo;
    }
    async exportJson() {
        const [products, customers, invoices] = await Promise.all([
            this.productsRepo.find({ relations: ['invoiceItems'] }),
            this.customersRepo.find(),
            this.invoicesRepo.find({ relations: ['items', 'customer', 'payments'] }),
        ]);
        return {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            products,
            customers,
            invoices,
        };
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ExportController.prototype, "exportJson", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(dev_jwt_auth_guard_1.DevJwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], ExportController);
//# sourceMappingURL=export.controller.js.map