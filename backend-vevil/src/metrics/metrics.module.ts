import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Customer, Invoice, InvoiceItem]),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
