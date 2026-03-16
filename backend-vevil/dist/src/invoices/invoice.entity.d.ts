import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
export declare class Invoice {
    id: number;
    customer: Customer;
    customerId: number;
    date: Date;
    total: number;
    currency: string;
    status: string;
    items: InvoiceItem[];
    payments: Payment[];
}
