import { ClientUsersService } from './client-users.service';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
export declare class ClientAuthController {
    private readonly clientUsersService;
    private invoicesRepository;
    constructor(clientUsersService: ClientUsersService, invoicesRepository: Repository<Invoice>);
    register(body: {
        email: string;
        password: string;
        name?: string;
        customerId?: number;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: number;
            email: string;
            name: string;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        error: string;
        token?: undefined;
        user?: undefined;
    } | {
        success: boolean;
        token: string;
        user: {
            id: number;
            email: string;
            name: string;
            customerId: number;
        };
        error?: undefined;
    }>;
    getMe(authHeader: string): Promise<{
        error: string;
        id?: undefined;
        email?: undefined;
        name?: undefined;
        customerId?: undefined;
    } | {
        id: number;
        email: string;
        name: string;
        customerId: number;
        error?: undefined;
    }>;
    getInvoices(authHeader: string): Promise<{
        error: string;
        invoices: any[];
    } | {
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
