import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private customersRepository;
    constructor(customersRepository: Repository<Customer>);
    create(createCustomerDto: CreateCustomerDto): any;
    findAll(): any;
    findPage(page?: number, limit?: number, filters?: {
        search?: string;
        department?: string;
    }): Promise<{
        data: Customer[];
        total: number;
    }>;
    getDepartments(): Promise<string[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<any>;
    remove(id: number): Promise<any>;
}
