import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './supplier.entity';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) {}

    @Get()
    async findAll(): Promise<Supplier[]> {
        return this.suppliersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Supplier | null> {
        return this.suppliersService.findOne(+id);
    }

    @Post()
    async create(@Body() data: Partial<Supplier>): Promise<Supplier> {
        return this.suppliersService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Supplier>): Promise<Supplier | null> {
        return this.suppliersService.update(+id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ success: boolean }> {
        await this.suppliersService.remove(+id);
        return { success: true };
    }
}