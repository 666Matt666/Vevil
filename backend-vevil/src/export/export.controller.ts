import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { DevJwtAuthGuard } from '../auth/guards/dev-jwt-auth.guard';

interface ExportData {
    exportedAt: string;
    version: string;
    products: Product[];
    customers: Customer[];
    invoices: Invoice[];
}

@Controller('export')
@UseGuards(DevJwtAuthGuard)
export class ExportController {
    constructor(
        @InjectRepository(Product)
        private productsRepo: Repository<Product>,
        @InjectRepository(Customer)
        private customersRepo: Repository<Customer>,
        @InjectRepository(Invoice)
        private invoicesRepo: Repository<Invoice>,
    ) {}

    @Get('json')
    async exportJson(): Promise<ExportData> {
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
}