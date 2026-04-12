"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const invoices_service_1 = require("./invoices.service");
const invoices_controller_1 = require("./invoices.controller");
const invoice_entity_1 = require("./invoice.entity");
const invoice_item_entity_1 = require("./invoice-item.entity");
const payment_entity_1 = require("./payment.entity");
const products_module_1 = require("../products/products.module");
const customers_module_1 = require("../customers/customers.module");
const stock_movements_module_1 = require("../stock-movements/stock-movements.module");
const mail_module_1 = require("../mail/mail.module");
const invoice_reminder_service_1 = require("./invoice-reminder.service");
let InvoicesModule = class InvoicesModule {
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([invoice_entity_1.Invoice, invoice_item_entity_1.InvoiceItem, payment_entity_1.Payment]),
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            stock_movements_module_1.StockMovementsModule,
            mail_module_1.MailModule,
        ],
        controllers: [invoices_controller_1.InvoicesController],
        providers: [invoices_service_1.InvoicesService, invoice_reminder_service_1.InvoiceReminderService],
        exports: [invoice_reminder_service_1.InvoiceReminderService],
    })
], InvoicesModule);
//# sourceMappingURL=invoices.module.js.map