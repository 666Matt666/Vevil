import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { InvoiceItem } from './invoice-item.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
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
            relations: ['customer', 'items', 'items.product'],
        });
    }

    async findOne(id: number) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product'],
        });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
}
