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

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        private productsService: ProductsService,
        private customersService: CustomersService,
        private dataSource: DataSource,
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
}
