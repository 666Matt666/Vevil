import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';
export declare class Invoice {
    id: number;
    customer: Customer;
    customerId: number;
    date: Date;
    total: number;
    items: InvoiceItem[];
}
