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
const customer_entity_1 = require("../customers/customer.entity");
let InvoicesService = class InvoicesService {
    constructor(invoicesRepository, paymentsRepository, customersRepository, productsService, customersService, stockMovementsService, dataSource, mailService) {
        this.invoicesRepository = invoicesRepository;
        this.paymentsRepository = paymentsRepository;
        this.customersRepository = customersRepository;
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
            let subtotal = 0;
            for (const itemDto of createInvoiceDto.items) {
                const databaseType = queryRunner.connection.options.type;
                let productResult;
                if (databaseType === 'postgres') {
                    const productQuery = `
                        SELECT id, name, price, stock, currency 
                        FROM product 
                        WHERE id = $1 
                        FOR UPDATE
                    `;
                    productResult = await queryRunner.query(productQuery, [itemDto.productId]);
                }
                else {
                    const productQuery = `
                        SELECT id, name, price, stock, currency 
                        FROM product 
                        WHERE id = $1
                    `;
                    productResult = await queryRunner.query(productQuery, [itemDto.productId]);
                }
                if (!productResult || productResult.length === 0) {
                    throw new common_1.NotFoundException(`Product with ID ${itemDto.productId} not found`);
                }
                const product = productResult[0];
                if (product.stock < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`);
                }
                await queryRunner.query('UPDATE product SET stock = stock - $1 WHERE id = $2', [itemDto.quantity, itemDto.productId]);
                const itemTotal = parseFloat(product.price) * itemDto.quantity;
                const invoiceItem = new invoice_item_entity_1.InvoiceItem();
                invoiceItem.product = product;
                invoiceItem.quantity = itemDto.quantity;
                invoiceItem.priceAtSale = product.price;
                invoice.items.push(invoiceItem);
                subtotal += itemTotal;
            }
            invoice.total = subtotal;
            const savedInvoice = await queryRunner.manager.save(invoice_entity_1.Invoice, invoice);
            await queryRunner.commitTransaction();
            for (const itemDto of createInvoiceDto.items) {
                await this.stockMovementsService.recordSale(itemDto.productId, itemDto.quantity, savedInvoice.id).catch(() => { });
            }
            if (createInvoiceDto.sendEmail && customer?.email) {
                const itemsForEmail = savedInvoice.items?.map((item) => ({
                    name: item.product?.name || `Producto ${item.productId}`,
                    quantity: item.quantity,
                    price: parseFloat(item.priceAtSale),
                    total: parseFloat(item.priceAtSale) * item.quantity,
                })) || [];
                this.mailService.sendInvoiceEmail(customer.email, customer.name, String(savedInvoice.id).padStart(7, '0'), Number(savedInvoice.total), savedInvoice.currency || 'PYG', itemsForEmail).catch((err) => console.error('Error sending invoice email:', err));
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
        const customer = invoice.customer;
        const existingPayments = invoice.payments || [];
        const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const pending = Number(invoice.total) - totalPaid;
        if (pending <= 0) {
            throw new common_1.BadRequestException('La factura ya está pagada completamente');
        }
        const requestedAmount = Number(dto.amount);
        if (requestedAmount <= 0) {
            throw new common_1.BadRequestException('El monto debe ser mayor a 0');
        }
        if (requestedAmount > pending) {
            throw new common_1.BadRequestException(`El monto no puede superar el pendiente (${pending})`);
        }
        const creditAvailable = Number(customer.creditBalance) || 0;
        const creditToApply = Math.min(creditAvailable, requestedAmount);
        const cashAmount = requestedAmount - creditToApply;
        if (creditToApply > 0) {
            customer.creditBalance = creditAvailable - creditToApply;
            await this.customersRepository.save(customer);
        }
        let cashPayment = null;
        if (cashAmount > 0) {
            cashPayment = this.paymentsRepository.create({
                invoiceId,
                amount: cashAmount,
                method: dto.method,
            });
            await this.paymentsRepository.save(cashPayment);
        }
        let creditPayment = null;
        if (creditToApply > 0) {
            creditPayment = this.paymentsRepository.create({
                invoiceId,
                amount: creditToApply,
                method: 'credit',
            });
            await this.paymentsRepository.save(creditPayment);
        }
        const newTotalPaid = totalPaid + creditToApply + cashAmount;
        invoice.status = newTotalPaid >= Number(invoice.total) ? 'paid' : 'pending';
        await this.invoicesRepository.save(invoice);
        return cashPayment || creditPayment;
    }
    async deletePayment(paymentId, invoiceId) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId, invoiceId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        if (payment.method === 'credit') {
            const invoice = await this.findOne(invoiceId);
            const customer = invoice.customer;
            customer.creditBalance = Number(customer.creditBalance) + Number(payment.amount);
            await this.customersRepository.save(customer);
        }
        await this.paymentsRepository.remove(payment);
        const invoice = await this.findOne(invoiceId);
        const payments = await this.paymentsRepository.find({ where: { invoiceId } });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        invoice.status = totalPaid >= Number(invoice.total) ? 'paid' : 'pending';
        await this.invoicesRepository.save(invoice);
        return payment;
    }
    async sendReminder(invoiceId) {
        try {
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
            if (!this.mailService.isConfigured()) {
                console.log('[sendReminder] MAIL_HOST not configured');
                return { sent: false, reason: 'Email no configurado en el servidor.' };
            }
            await this.mailService.sendPaymentReminderEmail(email, customerName, invoiceNumber, total, currency);
            return { sent: true };
        }
        catch (error) {
            console.error('[sendReminder] Error:', error.message, error.stack);
            return { sent: false, reason: `Error al enviar: ${error.message}` };
        }
    }
    async update(id, updateInvoiceDto) {
        const invoice = await this.findOne(id);
        if (invoice.status === 'paid') {
            throw new common_1.BadRequestException('No se puede editar una factura pagada. Cancele el pago primero.');
        }
        if (updateInvoiceDto.customerId) {
            const customer = await this.customersService.findOne(updateInvoiceDto.customerId);
            invoice.customer = customer;
        }
        if (updateInvoiceDto.currency) {
            invoice.currency = updateInvoiceDto.currency;
        }
        if (updateInvoiceDto.status) {
            invoice.status = updateInvoiceDto.status;
        }
        if (updateInvoiceDto.items && updateInvoiceDto.items.length > 0) {
            await this.invoicesRepository.manager.delete('invoice_items', { invoice: { id } });
            let total = 0;
            const items = [];
            for (const itemDto of updateInvoiceDto.items) {
                const product = itemDto.productId ? await this.productsService.findOne(itemDto.productId) : null;
                const item = new invoice_item_entity_1.InvoiceItem();
                item.product = product;
                item.quantity = itemDto.quantity || 1;
                item.priceAtSale = itemDto.priceAtSale || (product?.price || 0);
                total += item.priceAtSale * item.quantity;
                items.push(item);
            }
            invoice.items = items;
            invoice.total = total;
        }
        return this.invoicesRepository.save(invoice);
    }
    async remove(id) {
        const invoice = await this.findOne(id);
        if (invoice.status === 'paid') {
            throw new common_1.BadRequestException('No se puede eliminar una factura pagada. Cancele el pago primero.');
        }
        const payments = await this.paymentsRepository.find({ where: { invoice: { id } } });
        if (payments.length > 0) {
            throw new common_1.BadRequestException('No se puede eliminar una factura con pagos asociados.');
        }
        await this.invoicesRepository.remove(invoice);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        customers_service_1.CustomersService,
        stock_movements_service_1.StockMovementsService,
        typeorm_2.DataSource,
        mail_service_1.MailService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map