import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuditService } from '../audit/audit.service';
export declare class InvoicesController {
    private readonly invoicesService;
    private readonly auditService;
    constructor(invoicesService: InvoicesService, auditService: AuditService);
    private userFromReq;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice>;
    findAll(pageStr?: string, limitStr?: string, search?: string, customerIdStr?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<import("./invoice.entity").Invoice[] | {
        data: import("./invoice.entity").Invoice[];
        total: number;
    }>;
    updateStatus(id: string, dto: UpdateInvoiceStatusDto, req: any): Promise<import("./invoice.entity").Invoice>;
    getPayments(id: string): Promise<import("./payment.entity").Payment[]>;
    addPayment(id: string, dto: CreatePaymentDto, req: any): Promise<import("./payment.entity").Payment>;
    deletePayment(invoiceId: string, paymentId: string, req: any): Promise<{
        success: boolean;
    }>;
    findOne(id: string): Promise<import("./invoice.entity").Invoice>;
    sendReminder(id: string, req: any): Promise<{
        sent: boolean;
        reason?: string;
    }>;
    update(id: string, dto: UpdateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
