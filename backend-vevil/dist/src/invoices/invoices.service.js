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
const invoice_item_entity_1 = require("./invoice-item.entity");
const payment_entity_1 = require("./payment.entity");
const products_service_1 = require("../products/products.service");
const customers_service_1 = require("../customers/customers.service");
const stock_movements_service_1 = require("../stock-movements/stock-movements.service");
const mail_service_1 = require("../mail/mail.service");
let InvoicesService = class InvoicesService {
    constructor(invoicesRepository, paymentsRepository, productsService, customersService, stockMovementsService, dataSource, mailService) {
        this.invoicesRepository = invoicesRepository;
        this.paymentsRepository = paymentsRepository;
        this.productsService = productsService;
        this.customersService = customersService;
        this.stockMovementsService = stockMovementsService;
        this.dataSource = dataSource;
        this.mailService = mailService;
    }
    async create(createInvoiceDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const customer = await this.customersService.findOne(createInvoiceDto.customerId);
            const invoice = new invoice_entity_1.Invoice();
            invoice.customer = customer;
            invoice.currency = createInvoiceDto.currency || 'PYG';
            invoice.status = createInvoiceDto.status || 'pending';
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
            for (const itemDto of createInvoiceDto.items) {
                await this.stockMovementsService.recordSale(itemDto.productId, itemDto.quantity, savedInvoice.id).catch(() => { });
            }
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
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
    }
    async findPage(page = 1, limit = 10, filters) {
        const skip = Math.max(0, (page - 1) * limit);
        const take = Math.min(100, Math.max(1, limit));
        const qb = this.invoicesRepository
            .createQueryBuilder('inv')
            .leftJoinAndSelect('inv.customer', 'customer')
            .leftJoinAndSelect('inv.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('inv.payments', 'payments')
            .orderBy('inv.id', 'DESC');
        if (filters?.search?.trim()) {
            const term = `%${filters.search.trim().toLowerCase()}%`;
            qb.andWhere('(CAST(inv.id AS TEXT) LIKE :term OR LOWER(customer.name) LIKE :term)', { term });
        }
        if (filters?.customerId != null) {
            qb.andWhere('inv.customerId = :customerId', { customerId: filters.customerId });
        }
        if (filters?.status?.trim()) {
            qb.andWhere('inv.status = :status', { status: filters.status.trim() });
        }
        if (filters?.dateFrom) {
            qb.andWhere('inv.date >= :dateFrom', { dateFrom: filters.dateFrom });
        }
        if (filters?.dateTo) {
            qb.andWhere('inv.date <= :dateTo', { dateTo: `${filters.dateTo}T23:59:59.999Z` });
        }
        const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
        return { data, total };
    }
    async findOne(id) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
    async updateStatus(id, status) {
        const invoice = await this.findOne(id);
        invoice.status = status;
        return this.invoicesRepository.save(invoice);
    }
    async getPayments(invoiceId) {
        await this.findOne(invoiceId);
        return this.paymentsRepository.find({
            where: { invoiceId },
            order: { date: 'DESC' },
        });
    }
    async addPayment(invoiceId, dto) {
        const invoice = await this.findOne(invoiceId);
        const payment = this.paymentsRepository.create({
            invoiceId,
            amount: dto.amount,
            method: dto.method,
        });
        return this.paymentsRepository.save(payment);
    }
    async sendReminder(invoiceId) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status !== 'pending') {
            return { sent: false, reason: 'Solo se pueden enviar recordatorios de facturas pendientes.' };
        }
        const email = invoice.customer?.email?.trim();
        if (!email) {
            return { sent: false, reason: 'El cliente no tiene email registrado.' };
        }
        const invoiceNumber = String(invoice.id).padStart(7, '0');
        const total = Number(invoice.total);
        const currency = invoice.currency || 'PYG';
        const customerName = invoice.customer?.name || 'Cliente';
        await this.mailService.sendPaymentReminderEmail(email, customerName, invoiceNumber, total, currency);
        return { sent: true };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        customers_service_1.CustomersService,
        stock_movements_service_1.StockMovementsService,
        typeorm_2.DataSource,
        mail_service_1.MailService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map