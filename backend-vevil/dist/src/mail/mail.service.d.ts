import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    private readonly configService;
    constructor(mailerService: MailerService, configService: ConfigService);
    isConfigured(): boolean;
    private getFromAddress;
    private getBccAddress;
    sendResetPasswordEmail(to: string, resetLink: string): Promise<void>;
    sendRegistrationConfirmationEmail(to: string, confirmationLink: string): Promise<void>;
    sendPaymentReminderEmail(to: string, customerName: string, invoiceNumber: string, total: number, currency: string): Promise<void>;
    sendSetPasswordEmail(to: string, setPasswordLink: string): Promise<void>;
}
