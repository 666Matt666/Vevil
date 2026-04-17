import { Controller, Get, UseGuards, Res, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { DevJwtAuthGuard } from '../auth/guards/dev-jwt-auth.guard';
import { ExcelExportService } from './excel-export.service';

interface ExportData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
}

interface ExportJsonResponse extends ExportData {
  exportedAt: string;
  version: string;
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
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    @Inject(ExcelExportService)
    private excelExportService: ExcelExportService,
  ) {}

  @Get('json')
  async exportJson(): Promise<ExportJsonResponse> {
    const [products, customers, invoices, auditLogs] = await Promise.all([
      this.productsRepo.find({ relations: ['invoiceItems'] }),
      this.customersRepo.find(),
      this.invoicesRepo.find({ relations: ['items', 'customer', 'payments'] }),
      this.auditRepo.find({
        order: { createdAt: 'DESC' },
        take: 10000,
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      products,
      customers,
      invoices,
      auditLogs,
    };
  }

  @Get('excel')
  async exportExcel(@Res() res: Response) {
    try {
      const [products, customers, invoices, auditLogs] = await Promise.all([
        this.productsRepo.find({ relations: ['invoiceItems'] }),
        this.customersRepo.find(),
        this.invoicesRepo.find({ relations: ['items', 'customer', 'payments'] }),
        this.auditRepo.find({
          order: { createdAt: 'DESC' },
          take: 10000,
        }),
      ]);

      const data: ExportData = {
        products,
        customers,
        invoices,
        auditLogs,
      };

      const buffer = await this.excelExportService.generateExcelBuffer(data);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      const filename = `vevil-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error generating Excel:', error);
      res.status(500).json({ error: 'Error al generar archivo Excel' });
    }
  }
}
