import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';
export declare class CustomersController {
    private readonly customersService;
    private readonly auditService;
    constructor(customersService: CustomersService, auditService: AuditService);
    private userFromReq;
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<import("./customer.entity").Customer>;
    findAll(): Promise<import("./customer.entity").Customer[]>;
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<import("./customer.entity").Customer>;
    remove(id: string, req: any): Promise<import("./customer.entity").Customer>;
}
