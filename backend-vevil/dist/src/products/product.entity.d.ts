import { InvoiceItem } from '../invoices/invoice-item.entity';
export declare class Product {
    id: number;
    name: string;
    type: string;
    price: number;
    stock: number;
    description: string;
    invoiceItems: InvoiceItem[];
}
