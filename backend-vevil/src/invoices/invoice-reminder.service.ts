import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoiceReminderService {
    private readonly logger = new Logger(InvoiceReminderService.name);

    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        private mailService: MailService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async sendPendingInvoiceReminders() {
        this.logger.log('Iniciando envío de recordatorios de facturas pendientes...');

        if (!this.mailService.isConfigured()) {
            this.logger.warn('Email no configurado, saltando recordatorios');
            return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const pendingInvoices = await this.invoicesRepository.find({
            where: {
                status: 'pending',
            },
            relations: ['customer'],
        });

        let sentCount = 0;
        let failedCount = 0;

        for (const invoice of pendingInvoices) {
            if (!invoice.customer?.email) {
                continue;
            }

            const invoiceDate = new Date(invoice.date);
            if (invoiceDate > thirtyDaysAgo) {
                continue;
            }

            try {
                await this.mailService.sendPaymentReminderEmail(
                    invoice.customer.email,
                    invoice.customer.name,
                    String(invoice.id),
                    Number(invoice.total),
                    invoice.currency || 'PYG'
                );
                sentCount++;
                this.logger.log(`Recordatorio enviado para factura ${invoice.id}`);
            } catch (error) {
                failedCount++;
                this.logger.error(`Error al enviar recordatorio para factura ${invoice.id}:`, error);
            }
        }

        this.logger.log(`Recordatorios completados: ${sentCount} enviados, ${failedCount} fallidos`);
    }
}