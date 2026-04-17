import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { MailService } from '../mail/mail.service';
import { Customer } from '../customers/customer.entity';
export declare class InvoicesService {
    private invoicesRepository;
    private paymentsRepository;
    private customersRepository;
    private productsService;
    private customersService;
    private stockMovementsService;
    private dataSource;
    private mailService;
    constructor(invoicesRepository: Repository<Invoice>, paymentsRepository: Repository<Payment>, customersRepository: Repository<Customer>, productsService: ProductsService, customersService: CustomersService, stockMovementsService: StockMovementsService, dataSource: DataSource, mailService: MailService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findPage(page?: number, limit?: number, filters?: {
        search?: string;
        customerId?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        data: Invoice[];
        total: number;
    }>;
    findOne(id: number): Promise<Invoice>;
    updateStatus(id: number, status: string): Promise<Invoice>;
    getPayments(invoiceId: number): Promise<Payment[]>;
    addPayment(invoiceId: number, dto: CreatePaymentDto): Promise<Payment>;
    deletePayment(paymentId: number, invoiceId: number): Promise<Payment>;
    sendReminder(invoiceId: number): Promise<{
        sent: boolean;
        reason?: string;
    }>;
    update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice>;
    remove(id: number): Promise<void>;
}
