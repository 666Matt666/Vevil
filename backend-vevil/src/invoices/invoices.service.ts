import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { MailService } from '../mail/mail.service';
import { Customer } from '../customers/customer.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
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
                } else {
                    const productQuery = `
                        SELECT id, name, price, stock, currency 
                        FROM product 
                        WHERE id = $1
                    `;
                    productResult = await queryRunner.query(productQuery, [itemDto.productId]);
                }
                
                if (!productResult || productResult.length === 0) {
                    throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
                }
                
                const product = productResult[0];

                if (product.stock < itemDto.quantity) {
                    throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`);
                }

                await queryRunner.query(
                    'UPDATE product SET stock = stock - $1 WHERE id = $2',
                    [itemDto.quantity, itemDto.productId]
                );

                const itemTotal = parseFloat(product.price) * itemDto.quantity;

                const invoiceItem = new InvoiceItem();
                invoiceItem.product = product as any;
                invoiceItem.quantity = itemDto.quantity;
                invoiceItem.priceAtSale = product.price;

                invoice.items.push(invoiceItem);
                subtotal += itemTotal;
            }

            invoice.total = subtotal;

            const savedInvoice = await queryRunner.manager.save(Invoice, invoice);
            await queryRunner.commitTransaction();

            for (const itemDto of createInvoiceDto.items) {
                await this.stockMovementsService.recordSale(
                    itemDto.productId,
                    itemDto.quantity,
                    savedInvoice.id,
                ).catch(() => { /* no fallar la respuesta si falla el log */ });
            }

            // Enviar email al cliente si está habilitado
            if (createInvoiceDto.sendEmail && customer?.email) {
                const itemsForEmail = savedInvoice.items?.map((item: any) => ({
                    name: item.product?.name || `Producto ${item.productId}`,
                    quantity: item.quantity,
                    price: parseFloat(item.priceAtSale),
                    total: parseFloat(item.priceAtSale) * item.quantity,
                })) || [];

                this.mailService.sendInvoiceEmail(
                    customer.email,
                    customer.name,
                    String(savedInvoice.id).padStart(7, '0'),
                    Number(savedInvoice.total),
                    savedInvoice.currency || 'PYG',
                    itemsForEmail,
                ).catch((err) => console.error('Error sending invoice email:', err));
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
        const customer = invoice.customer;

        // Suma de pagos existentes
        const existingPayments = invoice.payments || [];
        const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const pending = Number(invoice.total) - totalPaid;

        if (pending <= 0) {
            throw new BadRequestException('La factura ya está pagada completamente');
        }

        const requestedAmount = Number(dto.amount);
        if (requestedAmount <= 0) {
            throw new BadRequestException('El monto debe ser mayor a 0');
        }
        if (requestedAmount > pending) {
            throw new BadRequestException(`El monto no puede superar el pendiente (${pending})`);
        }

        const creditAvailable = Number(customer.creditBalance) || 0;
        const creditToApply = Math.min(creditAvailable, requestedAmount);
        const cashAmount = requestedAmount - creditToApply;

        // Actualizar saldo del cliente si se usa crédito
        if (creditToApply > 0) {
            customer.creditBalance = creditAvailable - creditToApply;
            await this.customersRepository.save(customer);
        }

        let cashPayment: Payment | null = null;
        if (cashAmount > 0) {
            cashPayment = this.paymentsRepository.create({
                invoiceId,
                amount: cashAmount,
                method: dto.method,
            });
            await this.paymentsRepository.save(cashPayment);
        }

        let creditPayment: Payment | null = null;
        if (creditToApply > 0) {
            creditPayment = this.paymentsRepository.create({
                invoiceId,
                amount: creditToApply,
                method: 'credit',
            });
            await this.paymentsRepository.save(creditPayment);
        }

        // Actualizar estado de la factura
        const newTotalPaid = totalPaid + creditToApply + cashAmount;
        invoice.status = newTotalPaid >= Number(invoice.total) ? 'paid' : 'pending';
        await this.invoicesRepository.save(invoice);

        // Devolver el pago correspondiente al método solicitado (efectivo/tarjeta) o el de crédito si solo aplicó ese
        return cashPayment || creditPayment;
    }

    /**
     * Elimina un pago de una factura.
     */
    async deletePayment(paymentId: number, invoiceId: number) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId, invoiceId },
        });
        if (!payment) {
            throw new NotFoundException('Pago no encontrado');
        }

        // Si el pago fue con saldo a favor, restituir el crédito
        if (payment.method === 'credit') {
            const invoice = await this.findOne(invoiceId);
            const customer = invoice.customer;
            customer.creditBalance = Number(customer.creditBalance) + Number(payment.amount);
            await this.customersRepository.save(customer);
        }

        await this.paymentsRepository.remove(payment);

        // Recalcular estado de la factura
        const invoice = await this.findOne(invoiceId);
        const payments = await this.paymentsRepository.find({ where: { invoiceId } });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        invoice.status = totalPaid >= Number(invoice.total) ? 'paid' : 'pending';
        await this.invoicesRepository.save(invoice);

        return payment;
    }

    /**
     * Envía recordatorio de cobro por email al cliente de la factura (solo facturas pendientes).
     * Retorna { sent: true } si se envió, { sent: false, reason } si no (sin email, no configurado, o no pendiente).
     */
    async sendReminder(invoiceId: number): Promise<{ sent: boolean; reason?: string }> {
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
        } catch (error) {
            console.error('[sendReminder] Error:', error.message, error.stack);
            return { sent: false, reason: `Error al enviar: ${error.message}` };
        }
    }

    async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
        const invoice = await this.findOne(id);
        
        // Solo se pueden editar facturas pendientes o canceladas
        if (invoice.status === 'paid') {
            throw new BadRequestException('No se puede editar una factura pagada. Cancele el pago primero.');
        }
        
        // Actualizar cliente si se proporciona
        if (updateInvoiceDto.customerId) {
            const customer = await this.customersService.findOne(updateInvoiceDto.customerId);
            invoice.customer = customer;
        }
        
        // Actualizar moneda
        if (updateInvoiceDto.currency) {
            invoice.currency = updateInvoiceDto.currency;
        }
        
        // Actualizar estado
        if (updateInvoiceDto.status) {
            invoice.status = updateInvoiceDto.status;
        }
        
        // Actualizar items si se proporcionan
        if (updateInvoiceDto.items && updateInvoiceDto.items.length > 0) {
            // Eliminar items existentes
            await this.invoicesRepository.manager.delete('invoice_items', { invoice: { id } });
            
            // Crear nuevos items
            let total = 0;
            const items: InvoiceItem[] = [];
            
            for (const itemDto of updateInvoiceDto.items) {
                const product = itemDto.productId ? await this.productsService.findOne(itemDto.productId) : null;
                const item = new InvoiceItem();
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

    async remove(id: number): Promise<void> {
        const invoice = await this.findOne(id);
        
        // Solo se pueden eliminar facturas pendientes o canceladas
        if (invoice.status === 'paid') {
            throw new BadRequestException('No se puede eliminar una factura pagada. Cancele el pago primero.');
        }
        
        // Verificar si hay pagos asociados
        const payments = await this.paymentsRepository.find({ where: { invoice: { id } } });
        if (payments.length > 0) {
            throw new BadRequestException('No se puede eliminar una factura con pagos asociados.');
        }
        
        await this.invoicesRepository.remove(invoice);
    }
}
