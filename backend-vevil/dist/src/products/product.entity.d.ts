import { InvoiceItem } from '../invoices/invoice-item.entity';
export declare class Product {
    id: number;
    name: string;
    type: string;
    price: number;
    costPrice: number | null;
    currency: string;
    stock: number;
    minStock: number;
    category: string | null;
    description: string;
    invoiceItems: InvoiceItem[];
}
