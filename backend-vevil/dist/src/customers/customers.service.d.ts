import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private customersRepository;
    private invoicesRepository;
    constructor(customersRepository: Repository<Customer>, invoicesRepository: Repository<Invoice>);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    findPage(page?: number, limit?: number, filters?: {
        search?: string;
        department?: string;
    }): Promise<{
        data: Customer[];
        total: number;
    }>;
    getDepartments(): Promise<string[]>;
    findOne(id: number): Promise<Customer>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: number): Promise<Customer>;
}
