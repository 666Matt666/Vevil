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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../invoices/invoice.entity");
let PublicController = class PublicController {
    constructor(invoicesRepository) {
        this.invoicesRepository = invoicesRepository;
    }
    async getInvoicesByEmail(email) {
        if (!email) {
            return { error: 'Email es requerido', invoices: [] };
        }
        const invoices = await this.invoicesRepository.find({
            where: { customer: { email: email.toLowerCase() } },
            relations: ['customer', 'items', 'items.product'],
            order: { date: 'DESC' },
        });
        return {
            customer: invoices[0]?.customer ? {
                name: invoices[0].customer.name,
                email: invoices[0].customer.email,
                address: invoices[0].customer.address_street,
                city: invoices[0].customer.address_city,
                taxId: invoices[0].customer.tax_id,
            } : null,
            invoices: invoices.map(inv => ({
                id: inv.id,
                date: inv.date,
                total: inv.total,
                currency: inv.currency,
                status: inv.status,
                items: inv.items?.map(item => ({
                    productName: item.product?.name || `Producto #${item.productId}`,
                    quantity: item.quantity,
                    price: item.priceAtSale,
                    total: Number(item.priceAtSale) * item.quantity,
                })) || [],
            })),
        };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('invoices-by-email'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getInvoicesByEmail", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('api/public'),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PublicController);
//# sourceMappingURL=public.controller.js.map