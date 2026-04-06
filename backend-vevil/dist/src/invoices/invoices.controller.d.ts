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
    create(createInvoiceDto: CreateInvoiceDto, req: any): unknown;
    findAll(pageStr?: string, limitStr?: string, search?: string, customerIdStr?: string, status?: string, dateFrom?: string, dateTo?: string): unknown;
    updateStatus(id: string, dto: UpdateInvoiceStatusDto, req: any): unknown;
    getPayments(id: string): unknown;
    addPayment(id: string, dto: CreatePaymentDto, req: any): unknown;
    deletePayment(invoiceId: string, paymentId: string, req: any): unknown;
    findOne(id: string): unknown;
    sendReminder(id: string, req: any): unknown;
    update(id: string, dto: UpdateInvoiceDto, req: any): unknown;
    remove(id: string, req: any): unknown;
}
