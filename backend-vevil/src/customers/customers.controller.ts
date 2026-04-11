import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';

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
    getDepartments() {
        return this.customersService.getDepartments();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(+id);
    }

    @Patch(':id')
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
