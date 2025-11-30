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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const products_service_1 = require("../products/products.service");
const customers_service_1 = require("../customers/customers.service");
const invoice_item_entity_1 = require("./invoice-item.entity");
let InvoicesService = class InvoicesService {
    constructor(invoicesRepository, productsService, customersService, dataSource) {
        this.invoicesRepository = invoicesRepository;
        this.productsService = productsService;
        this.customersService = customersService;
        this.dataSource = dataSource;
    }
    async create(createInvoiceDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const customer = await this.customersService.findOne(createInvoiceDto.customerId);
            const invoice = new invoice_entity_1.Invoice();
            invoice.customer = customer;
            invoice.items = [];
            let total = 0;
            for (const itemDto of createInvoiceDto.items) {
                const product = await this.productsService.findOne(itemDto.productId);
                if (product.stock < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
                }
                await this.productsService.update(product.id, {
                    stock: product.stock - itemDto.quantity,
                });
                const invoiceItem = new invoice_item_entity_1.InvoiceItem();
                invoiceItem.product = product;
                invoiceItem.quantity = itemDto.quantity;
                invoiceItem.priceAtSale = product.price;
                invoice.items.push(invoiceItem);
                total += parseFloat(product.price) * itemDto.quantity;
            }
            invoice.total = total;
            const savedInvoice = await queryRunner.manager.save(invoice_entity_1.Invoice, invoice);
            await queryRunner.commitTransaction();
            return savedInvoice;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    findAll() {
        return this.invoicesRepository.find({
            relations: ['customer', 'items', 'items.product'],
        });
    }
    async findOne(id) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        products_service_1.ProductsService,
        customers_service_1.CustomersService,
        typeorm_2.DataSource])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map