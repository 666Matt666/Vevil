import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
export declare class PublicController {
    private invoicesRepository;
    constructor(invoicesRepository: Repository<Invoice>);
    getInvoicesByEmail(email: string): Promise<{
        error: string;
        invoices: any[];
        customer?: undefined;
    } | {
        customer: {
            name: string;
            email: string;
            address: string;
            city: string;
            taxId: string;
        };
        invoices: {
            id: number;
            date: Date;
            total: number;
            currency: string;
            status: string;
            items: {
                productName: string;
                quantity: number;
                price: number;
                total: number;
            }[];
        }[];
        error?: undefined;
    }>;
}
