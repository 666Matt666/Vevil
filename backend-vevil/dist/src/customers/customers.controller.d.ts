import { AuditService } from '../audit/audit.service';
import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    private readonly auditService;
    constructor(customersService: CustomersService, auditService: AuditService);
    private userFromReq;
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<Customer>;
    findAll(pageStr?: string, limitStr?: string, search?: string, department?: string): Promise<Customer[] | {
        data: Customer[];
        total: number;
    }>;
    getDepartments(): Promise<string[]>;
    findOne(id: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<Customer>;
    remove(id: string, req: any): Promise<Customer>;
}
