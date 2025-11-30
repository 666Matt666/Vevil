import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<import("./invoice.entity").Invoice>;
    findAll(): Promise<import("./invoice.entity").Invoice[]>;
    findOne(id: string): Promise<import("./invoice.entity").Invoice>;
}
