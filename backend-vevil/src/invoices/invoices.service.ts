import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        private productsService: ProductsService,
        private customersService: CustomersService,
        private stockMovementsService: StockMovementsService,
        private dataSource: DataSource,
        private mailService: MailService,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const customer = await this.customersService.findOne(createInvoiceDto.customerId);
            const invoice = new Invoice();
            invoice.customer = customer;
            invoice.currency = createInvoiceDto.currency || 'PYG';
            invoice.status = createInvoiceDto.status || 'pending';
            invoice.items = [];
            let total = 0;

            for (const itemDto of createInvoiceDto.items) {
                const product = await this.productsService.findOne(itemDto.productId);

                if (product.stock < itemDto.quantity) {
                    throw new BadRequestException(`Insufficient stock for product ${product.name}`);
                }

                // Deduct stock
                await this.productsService.update(product.id, {
                    stock: product.stock - itemDto.quantity,
                });

                const invoiceItem = new InvoiceItem();
                invoiceItem.product = product;
                invoiceItem.quantity = itemDto.quantity;
                invoiceItem.priceAtSale = product.price; // Snapshot price at time of invoice

                invoice.items.push(invoiceItem);
                total += parseFloat(product.price as any) * itemDto.quantity;
            }

            invoice.total = total;

            const savedInvoice = await queryRunner.manager.save(Invoice, invoice);
            await queryRunner.commitTransaction();

            // Registrar movimientos de stock por venta (historial)
            for (const itemDto of createInvoiceDto.items) {
                await this.stockMovementsService.recordSale(
                    itemDto.productId,
                    itemDto.quantity,
                    savedInvoice.id,
                ).catch(() => { /* no fallar la respuesta si falla el log */ });
            }

            return savedInvoice;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    findAll() {
        return this.invoicesRepository.find({
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
    }

    async findPage(
        page: number = 1,
        limit: number = 10,
        filters?: { search?: string; customerId?: number; status?: string; dateFrom?: string; dateTo?: string },
    ): Promise<{ data: Invoice[]; total: number }> {
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
            qb.andWhere(
                '(CAST(inv.id AS TEXT) LIKE :term OR LOWER(customer.name) LIKE :term)',
                { term },
            );
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

    async findOne(id: number) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }

    async updateStatus(id: number, status: string) {
        const invoice = await this.findOne(id);
        invoice.status = status;
        return this.invoicesRepository.save(invoice);
    }

    async getPayments(invoiceId: number) {
        await this.findOne(invoiceId);
        return this.paymentsRepository.find({
            where: { invoiceId },
            order: { date: 'DESC' },
        });
    }

    async addPayment(invoiceId: number, dto: CreatePaymentDto) {
        const invoice = await this.findOne(invoiceId);
        const payment = this.paymentsRepository.create({
            invoiceId,
            amount: dto.amount,
            method: dto.method,
        });
        return this.paymentsRepository.save(payment);
    }

    /**
     * Envía recordatorio de cobro por email al cliente de la factura (solo facturas pendientes).
     * Retorna { sent: true } si se envió, { sent: false, reason } si no (sin email, no configurado, o no pendiente).
     */
    async sendReminder(invoiceId: number): Promise<{ sent: boolean; reason?: string }> {
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
}
