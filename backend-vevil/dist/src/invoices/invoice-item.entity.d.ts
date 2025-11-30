import { Product } from '../products/product.entity';
import { Invoice } from './invoice.entity';
export declare class InvoiceItem {
    id: number;
    quantity: number;
    priceAtSale: number;
    product: Product;
    productId: number;
    invoice: Invoice;
    invoiceId: number;
    getTotal(): number;
}
