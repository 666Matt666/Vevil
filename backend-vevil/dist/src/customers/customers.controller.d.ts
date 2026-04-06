import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';
export declare class CustomersController {
    private readonly customersService;
    private readonly auditService;
    constructor(customersService: CustomersService, auditService: AuditService);
    private userFromReq;
    create(createCustomerDto: CreateCustomerDto, req: any): unknown;
    findAll(pageStr?: string, limitStr?: string, search?: string, department?: string): unknown;
    getDepartments(): Promise<{}>;
    findOne(id: string): unknown;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): unknown;
    remove(id: string, req: any): unknown;
}
