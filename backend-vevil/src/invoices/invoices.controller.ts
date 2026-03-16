import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuditService } from '../audit/audit.service';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly auditService: AuditService,
    ) {}

    private userFromReq(req: any) {
        const u = req?.user;
        return { userId: u?.userId ?? u?.id ?? null, userEmail: u?.email ?? u?.username ?? null };
    }

    @Post()
    async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
        const created = await this.invoicesService.create(createInvoiceDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.created',
            entityType: 'invoice',
            entityId: String(created.id),
            newValue: { total: created.total, status: created.status, customerId: created.customerId },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return created;
    }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto, @Request() req: any) {
        const previous = await this.invoicesService.findOne(+id);
        const updated = await this.invoicesService.updateStatus(+id, dto.status);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.status_updated',
            entityType: 'invoice',
            entityId: id,
            oldValue: { status: previous.status },
            newValue: { status: updated.status },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return updated;
    }

    @Get(':id/payments')
    getPayments(@Param('id') id: string) {
        return this.invoicesService.getPayments(+id);
    }

    @Post(':id/payments')
    async addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto, @Request() req: any) {
        const payment = await this.invoicesService.addPayment(+id, dto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.payment_added',
            entityType: 'invoice',
            entityId: id,
            newValue: { paymentId: payment.id, amount: dto.amount },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return payment;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(+id);
    }

    @Post(':id/send-reminder')
    async sendReminder(@Param('id') id: string, @Request() req: any) {
        const result = await this.invoicesService.sendReminder(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.reminder_sent',
            entityType: 'invoice',
            entityId: id,
            newValue: result,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return result;
    }
}
