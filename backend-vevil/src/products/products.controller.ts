import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuditService } from '../audit/audit.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';


@ApiTags('Products')
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
    @ApiOperation({ summary: 'Crear un nuevo producto' })
    @ApiResponse({ status: 201, description: 'Producto creado exitosamente', type: Product })
    @ApiBearerAuth()
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
    @ApiOperation({ summary: 'Obtener lista de productos (con soporte de paginación)' })
    @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente', type: [Product] })
    @ApiBearerAuth()
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
    @ApiOperation({ summary: 'Obtener un producto por ID' })
    @ApiResponse({ status: 200, description: 'Producto encontrado', type: Product })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @ApiBearerAuth()
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un producto' })
    @ApiResponse({ status: 200, description: 'Producto actualizado', type: Product })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @ApiBearerAuth()
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
    @ApiOperation({ summary: 'Eliminar un producto' })
    @ApiResponse({ status: 200, description: 'Producto eliminado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @ApiBearerAuth()
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
