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
    findAll(pageStr?: string, limitStr?: string, search?: string, department?: string): Promise<import("./customer.entity").Customer[] | {
        data: import("./customer.entity").Customer[];
        total: number;
    }>;
    getDepartments(): Promise<string[]>;
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<import("./customer.entity").Customer>;
    remove(id: string, forceStr: string, req: any): Promise<import("./customer.entity").Customer | {
        cannotDelete: boolean;
        message: string;
        invoices: {
            id: number;
            number: number;
            date: Date;
            total: number;
            status: string;
        }[];
    }>;
}
