import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): Promise<import("./customer.entity").Customer>;
    findAll(): Promise<import("./customer.entity").Customer[]>;
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./customer.entity").Customer>;
    remove(id: string): Promise<import("./customer.entity").Customer>;
}
