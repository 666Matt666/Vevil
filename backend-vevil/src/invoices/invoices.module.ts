import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './invoice.entity';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

import { InvoiceItem } from './invoice-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, InvoiceItem]),
        ProductsModule,
        CustomersModule,
    ],
    controllers: [InvoicesController],
    providers: [InvoicesService],
})
export class InvoicesModule { }
