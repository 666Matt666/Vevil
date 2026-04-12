import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { MailService } from '../mail/mail.service';
export declare class InvoiceReminderService {
    private invoicesRepository;
    private mailService;
    private readonly logger;
    constructor(invoicesRepository: Repository<Invoice>, mailService: MailService);
    sendPendingInvoiceReminders(): Promise<void>;
}
