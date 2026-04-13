import { Controller, Post, Get, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { ClientUsersService } from './client-users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import * as bcrypt from 'bcrypt';

@Controller('api/client')
export class ClientAuthController {
    constructor(
        private readonly clientUsersService: ClientUsersService,
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
    ) {}

    @Post('register')
    async register(@Body() body: { email: string; password: string; name?: string; customerId?: number }) {
        const user = await this.clientUsersService.register(body.email, body.password, body.customerId);
        
        // Update name if provided
        if (body.name) {
            user.name = body.name;
            await this.clientUsersService.updateName(user.id, body.name);
        }

        // Generate token
        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        
        return { 
            success: true, 
            token,
            user: { id: user.id, email: user.email, name: body.name || user.name }
        };
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.clientUsersService.validate(body.email, body.password);
        if (!user) {
            return { success: false, error: 'Email o contraseña incorrectos' };
        }

        // Generate simple token (in production use JWT)
        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        
        return { 
            success: true, 
            token,
            user: { id: user.id, email: user.email, name: user.name, customerId: user.customerId }
        };
    }

    @Get('me')
    async getMe(@Headers('authorization') authHeader: string) {
        if (!authHeader) {
            return { error: 'No autorizado' };
        }

        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = Buffer.from(token, 'base64').toString();
            const [id] = decoded.split(':');
            
            const user = await this.clientUsersService.findById(parseInt(id));
            if (!user) {
                return { error: 'Usuario no encontrado' };
            }

            return { 
                id: user.id, 
                email: user.email, 
                name: user.name,
                customerId: user.customerId
            };
        } catch {
            return { error: 'Token inválido' };
        }
    }

    @Get('invoices')
    async getInvoices(@Headers('authorization') authHeader: string) {
        if (!authHeader) {
            return { error: 'No autorizado', invoices: [] };
        }

        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = Buffer.from(token, 'base64').toString();
            const [id] = decoded.split(':');
            
            const user = await this.clientUsersService.findById(parseInt(id));
            if (!user) {
                return { error: 'Usuario no encontrado', invoices: [] };
            }

            // Get invoices for this customer's email
            const invoices = await this.invoicesRepository.find({
                where: { customer: { email: user.email } },
                relations: ['customer', 'items', 'items.product'],
                order: { date: 'DESC' },
            });

            return {
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
        } catch {
            return { error: 'Token inválido', invoices: [] };
        }
    }
}