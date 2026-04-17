import { Controller, Get, Post, Patch, Put, Delete, Body, Param, UseGuards, Request, Query, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuditService } from '../audit/audit.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './invoice.entity';
import { InvoicesService } from './invoices.service';
import { Payment } from './payment.entity';


@ApiTags('Invoices')
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
    @ApiOperation({ summary: 'Crear una nueva factura (con transacción y stock)' })
    @ApiResponse({ status: 201, description: 'Factura creada exitosamente', type: Invoice })
    @ApiBearerAuth()
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
    @ApiOperation({ summary: 'Obtener lista de facturas (con paginación y filtros)' })
    @ApiResponse({ status: 200, description: 'Lista de facturas obtenida exitosamente', type: [Invoice] })
    @ApiBearerAuth()
    async findAll(
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
        @Query('search') search?: string,
        @Query('customerId') customerIdStr?: string,
        @Query('status') status?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        const page = pageStr != null ? parseInt(pageStr, 10) : NaN;
        const limit = limitStr != null ? parseInt(limitStr, 10) : NaN;
        const customerId = customerIdStr != null ? parseInt(customerIdStr, 10) : undefined;
        if (Number.isFinite(page) && Number.isFinite(limit)) {
            return this.invoicesService.findPage(page, limit, {
                search,
                customerId: Number.isFinite(customerId) ? customerId : undefined,
                status,
                dateFrom,
                dateTo,
            });
        }
        return this.invoicesService.findAll();
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Actualizar el estado de una factura' })
    @ApiResponse({ status: 200, description: 'Estado actualizado', type: Invoice })
    @ApiBearerAuth()
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
    @ApiOperation({ summary: 'Obtener pagos de una factura' })
    @ApiResponse({ status: 200, description: 'Lista de pagos', type: [Payment] })
    @ApiBearerAuth()
    getPayments(@Param('id') id: string) {
        return this.invoicesService.getPayments(+id);
    }

    @Post(':id/payments')
    @ApiOperation({ summary: 'Agregar un pago a una factura' })
    @ApiResponse({ status: 201, description: 'Pago creado', type: Payment })
    @ApiBearerAuth()
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

    @Delete(':invoiceId/payments/:paymentId')
    @ApiOperation({ summary: 'Eliminar un pago de una factura' })
    @ApiResponse({ status: 200, description: 'Pago eliminado' })
    @ApiBearerAuth()
    async deletePayment(
        @Param('invoiceId') invoiceId: string,
        @Param('paymentId') paymentId: string,
        @Request() req: any
    ) {
        const payment = await this.invoicesService.deletePayment(+paymentId, +invoiceId);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.payment_deleted',
            entityType: 'invoice',
            entityId: invoiceId,
            oldValue: { paymentId: payment.id, amount: payment.amount },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return { success: true };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una factura por ID' })
    @ApiResponse({ status: 200, description: 'Factura encontrada', type: Invoice })
    @ApiResponse({ status: 404, description: 'Factura no encontrada' })
    @ApiBearerAuth()
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(+id);
    }

    @Post(':id/send-reminder')
    @ApiOperation({ summary: 'Enviar recordatorio de pago por email' })
    @ApiResponse({ status: 200, description: 'Resultado del envío' })
    @ApiBearerAuth()
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

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una factura (solo pendiente/cancelada)' })
    @ApiResponse({ status: 200, description: 'Factura actualizada', type: Invoice })
    @ApiResponse({ status: 400, description: 'No se puede editar factura pagada' })
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto, @Request() req: any) {
        const previous = await this.invoicesService.findOne(+id);
        const updated = await this.invoicesService.update(+id, dto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.updated',
            entityType: 'invoice',
            entityId: id,
            oldValue: { total: previous.total, status: previous.status, customerId: previous.customerId },
            newValue: { total: updated.total, status: updated.status, customerId: updated.customerId },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return updated;
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar una factura (solo pendiente/cancelada)' })
    @ApiResponse({ status: 204, description: 'Factura eliminada' })
    @ApiResponse({ status: 400, description: 'No se puede eliminar factura pagada o con pagos' })
    @ApiBearerAuth()
    async remove(@Param('id') id: string, @Request() req: any) {
        const invoice = await this.invoicesService.findOne(+id);
        await this.invoicesService.remove(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'invoice.deleted',
            entityType: 'invoice',
            entityId: id,
            oldValue: { id: invoice.id, total: invoice.total, status: invoice.status },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return { success: true };
    }
}
