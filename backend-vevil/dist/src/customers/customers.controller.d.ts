import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';
export declare class CustomersController {
    private readonly customersService;
    private readonly auditService;
    constructor(customersService: CustomersService, auditService: AuditService);
    private userFromReq;
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<any>;
    findAll(pageStr?: string, limitStr?: string, search?: string, department?: string): Promise<any>;
    getDepartments(): Promise<string[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<any>;
}
