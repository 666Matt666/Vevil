import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { ExportController } from './export.controller';
import { ExcelExportService } from './excel-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, Invoice, AuditLog])],
  controllers: [ExportController],
  providers: [ExcelExportService],
  exports: [],
})
export class ExportModule {}
