import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { ExportController } from './export.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, Invoice])],
  controllers: [ExportController],
  exports: [],
})
export class ExportModule {}