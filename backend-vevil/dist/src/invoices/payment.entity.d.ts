import { Invoice } from './invoice.entity';
export declare class Payment {
    id: number;
    invoice: Invoice;
    invoiceId: number;
    amount: number;
    date: Date;
    method: string;
}
