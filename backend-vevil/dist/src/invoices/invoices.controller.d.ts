import { AuditService } from '../audit/audit.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './invoice.entity';
import { InvoicesService } from './invoices.service';
import { Payment } from './payment.entity';
export declare class InvoicesController {
    private readonly invoicesService;
    private readonly auditService;
    constructor(invoicesService: InvoicesService, auditService: AuditService);
    private userFromReq;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<Invoice>;
    findAll(pageStr?: string, limitStr?: string, search?: string, customerIdStr?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<Invoice[] | {
        data: Invoice[];
        total: number;
    }>;
    updateStatus(id: string, dto: UpdateInvoiceStatusDto, req: any): Promise<Invoice>;
    getPayments(id: string): Promise<Payment[]>;
    addPayment(id: string, dto: CreatePaymentDto, req: any): Promise<Payment>;
    deletePayment(invoiceId: string, paymentId: string, req: any): Promise<{
        success: boolean;
    }>;
    findOne(id: string): Promise<Invoice>;
    sendReminder(id: string, req: any): Promise<{
        sent: boolean;
        reason?: string;
    }>;
    update(id: string, dto: UpdateInvoiceDto, req: any): Promise<Invoice>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
