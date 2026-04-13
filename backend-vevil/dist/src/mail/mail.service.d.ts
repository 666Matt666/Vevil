import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private resend;
    constructor(configService: ConfigService);
    isConfigured(): boolean;
    private getFromAddress;
    private getBccAddress;
    sendResetPasswordEmail(to: string, resetLink: string): Promise<void>;
    sendRegistrationConfirmationEmail(to: string, confirmationLink: string): Promise<void>;
    sendPaymentReminderEmail(to: string, customerName: string, invoiceNumber: string, total: number, currency: string): Promise<void>;
    sendSetPasswordEmail(to: string, setPasswordLink: string): Promise<void>;
    sendInvoiceEmail(to: string, customerName: string, invoiceNumber: string, total: number, currency: string, items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[], invoicePdfBase64?: string): Promise<void>;
}
