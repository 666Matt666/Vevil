import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';

@Controller('api/public')
export class PublicController {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
    ) {}

    @Get('invoices-by-email')
    async getInvoicesByEmail(@Query('email') email: string) {
        if (!email) {
            return { error: 'Email es requerido', invoices: [] };
        }

        const invoices = await this.invoicesRepository.find({
            where: { customer: { email: email.toLowerCase() } },
            relations: ['customer', 'items', 'items.product'],
            order: { date: 'DESC' },
        });

        return {
            customer: invoices[0]?.customer ? {
                name: invoices[0].customer.name,
                email: invoices[0].customer.email,
                address: invoices[0].customer.address_street,
                city: invoices[0].customer.address_city,
                taxId: invoices[0].customer.tax_id,
            } : null,
            invoices: invoices.map(inv => ({
                id: inv.id,
                date: inv.date,
                total: inv.total,
                currency: inv.currency,
                status: inv.status,
                items: inv.items?.map(item => ({
                    productName: item.product?.name || `Producto #${item.productId}`,
                    quantity: item.quantity,
                    price: item.priceAtSale,
                    total: Number(item.priceAtSale) * item.quantity,
                })) || [],
            })),
        };
    }
}