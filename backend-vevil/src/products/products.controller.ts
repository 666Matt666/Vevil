import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly auditService: AuditService,
    ) {}

    private userFromReq(req: any) {
        const u = req?.user;
        return { userId: u?.userId ?? u?.id ?? null, userEmail: u?.email ?? u?.username ?? null };
    }

    @Post()
    async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
        const created = await this.productsService.create(createProductDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.created',
            entityType: 'product',
            entityId: String(created.id),
            newValue: { name: created.name, price: created.price },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return created;
    }

    @Get()
    async findAll(
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('category') category?: string,
    ) {
        const page = pageStr != null ? parseInt(pageStr, 10) : NaN;
        const limit = limitStr != null ? parseInt(limitStr, 10) : NaN;
        if (Number.isFinite(page) && Number.isFinite(limit)) {
            return this.productsService.findPage(page, limit, { search, type, category });
        }
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
        const previous = await this.productsService.findOne(+id);
        const updated = await this.productsService.update(+id, updateProductDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.updated',
            entityType: 'product',
            entityId: id,
            oldValue: { name: previous.name, price: previous.price },
            newValue: updateProductDto as Record<string, unknown>,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: any) {
        const removed = await this.productsService.remove(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.deleted',
            entityType: 'product',
            entityId: id,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => {});
        return removed;
    }
}
