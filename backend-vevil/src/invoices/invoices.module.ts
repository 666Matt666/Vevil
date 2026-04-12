import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { MailModule } from '../mail/mail.module';
import { InvoiceReminderService } from './invoice-reminder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, InvoiceItem, Payment]),
        ProductsModule,
        CustomersModule,
        StockMovementsModule,
        MailModule,
    ],
    controllers: [InvoicesController],
    providers: [InvoicesService, InvoiceReminderService],
    exports: [InvoiceReminderService],
})
export class InvoicesModule { }
