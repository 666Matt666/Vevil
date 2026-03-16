import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { MailService } from '../mail/mail.service';
export declare class InvoicesService {
    private invoicesRepository;
    private paymentsRepository;
    private productsService;
    private customersService;
    private stockMovementsService;
    private dataSource;
    private mailService;
    constructor(invoicesRepository: Repository<Invoice>, paymentsRepository: Repository<Payment>, productsService: ProductsService, customersService: CustomersService, stockMovementsService: StockMovementsService, dataSource: DataSource, mailService: MailService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: number): Promise<Invoice>;
    updateStatus(id: number, status: string): Promise<Invoice>;
    getPayments(invoiceId: number): Promise<Payment[]>;
    addPayment(invoiceId: number, dto: CreatePaymentDto): Promise<Payment>;
    sendReminder(invoiceId: number): Promise<{
        sent: boolean;
        reason?: string;
    }>;
}
