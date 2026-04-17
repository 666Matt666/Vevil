import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuditService } from '../audit/audit.service';

import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly auditService: AuditService,
    ) {}

    private userFromReq(req: any) {
        const u = req?.user;
        return { userId: u?.userId ?? u?.id ?? null, userEmail: u?.email ?? u?.username ?? null };
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente creado exitosamente', type: Customer })
    @ApiBearerAuth()
    async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
        const created = await this.customersService.create(createCustomerDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'customer.created',
            entityType: 'customer',
            entityId: String(created.id),
            newValue: { name: created.name, email: created.email },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return created;
    }

    @Get()
    @ApiOperation({ summary: 'Obtener lista de clientes (con soporte de paginación)' })
    @ApiResponse({ status: 200, description: 'Lista de clientes obtenida exitosamente', type: [Customer] })
    @ApiBearerAuth()
    async findAll(
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
        @Query('search') search?: string,
        @Query('department') department?: string,
    ) {
        const page = pageStr != null ? parseInt(pageStr, 10) : NaN;
        const limit = limitStr != null ? parseInt(limitStr, 10) : NaN;
        if (Number.isFinite(page) && Number.isFinite(limit)) {
            return this.customersService.findPage(page, limit, { search, department });
        }
        return this.customersService.findAll();
    }

    @Get('meta/departments')
    @ApiOperation({ summary: 'Obtener lista de departamentos únicos' })
    @ApiResponse({ status: 200, description: 'Lista de departamentos', type: [String] })
    @ApiBearerAuth()
    getDepartments() {
        return this.customersService.getDepartments();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un cliente por ID' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Customer })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    @ApiBearerAuth()
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un cliente' })
    @ApiResponse({ status: 200, description: 'Cliente actualizado', type: Customer })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
        const previous = await this.customersService.findOne(+id);
        const updated = await this.customersService.update(+id, updateCustomerDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'customer.updated',
            entityType: 'customer',
            entityId: id,
            oldValue: { name: previous.name, email: previous.email },
            newValue: updateCustomerDto as Record<string, unknown>,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return updated;
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un cliente' })
    @ApiResponse({ status: 204, description: 'Cliente eliminado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    @ApiBearerAuth()
    async remove(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        const result = await this.customersService.remove(+id);
        
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'customer.deleted',
            entityType: 'customer',
            entityId: id,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return result;
    }
}
