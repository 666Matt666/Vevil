import { Repository } from 'typeorm';
import { Response } from 'express';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { AuditLog } from '../audit/audit-log.entity';
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
export declare class ExportController {
    private productsRepo;
    private customersRepo;
    private invoicesRepo;
    private auditRepo;
    private excelExportService;
    constructor(productsRepo: Repository<Product>, customersRepo: Repository<Customer>, invoicesRepo: Repository<Invoice>, auditRepo: Repository<AuditLog>, excelExportService: ExcelExportService);
    exportJson(): Promise<ExportJsonResponse>;
    exportExcel(res: Response): Promise<void>;
}
export {};
