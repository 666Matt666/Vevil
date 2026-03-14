import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
        return this.invoicesService.updateStatus(+id, dto.status);
    }

    @Get(':id/payments')
    getPayments(@Param('id') id: string) {
        return this.invoicesService.getPayments(+id);
    }

    @Post(':id/payments')
    addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
        return this.invoicesService.addPayment(+id, dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(+id);
    }
}
