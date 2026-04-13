import { Customer } from '../customers/customer.entity';
export declare class ClientUser {
    id: number;
    email: string;
    password: string;
    name: string;
    customerId: number;
    customer: Customer;
    isActive: boolean;
    createdAt: Date;
}
