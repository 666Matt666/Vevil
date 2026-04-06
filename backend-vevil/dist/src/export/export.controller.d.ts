import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
interface ExportData {
    exportedAt: string;
    version: string;
    products: Product[];
    customers: Customer[];
    invoices: Invoice[];
}
export declare class ExportController {
    private productsRepo;
    private customersRepo;
    private invoicesRepo;
    constructor(productsRepo: Repository<Product>, customersRepo: Repository<Customer>, invoicesRepo: Repository<Invoice>);
    exportJson(): Promise<ExportData>;
}
export {};
