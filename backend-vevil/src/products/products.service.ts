import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    create(createProductDto: CreateProductDto) {
        const product = this.productsRepository.create({
            ...createProductDto,
            currency: createProductDto.currency || 'PYG',
            minStock: createProductDto.minStock ?? 0,
            costPrice: createProductDto.costPrice ?? null,
            category: createProductDto.category ?? null,
        });
        return this.productsRepository.save(product);
    }

    findAll() {
        return this.productsRepository.find({
            relations: ['invoiceItems'],
        });
    }

    async findPage(
        page: number = 1,
        limit: number = 10,
        filters?: { search?: string; type?: string; category?: string },
    ): Promise<{ data: Product[]; total: number }> {
        const skip = Math.max(0, (page - 1) * limit);
        const take = Math.min(100, Math.max(1, limit));
        const qb = this.productsRepository.createQueryBuilder('p')
            .leftJoinAndSelect('p.invoiceItems', 'invoiceItems')
            .orderBy('p.id', 'ASC');
        if (filters?.search?.trim()) {
            qb.andWhere('LOWER(p.name) LIKE LOWER(:search)', { search: `%${filters.search.trim()}%` });
        }
        if (filters?.type && filters.type !== 'all') {
            qb.andWhere('p.type = :type', { type: filters.type });
        }
        if (filters?.category !== undefined && filters?.category !== 'all') {
            if (filters.category === '') {
                qb.andWhere('(p.category IS NULL OR p.category = \'\')');
            } else {
                qb.andWhere('p.category = :category', { category: filters.category });
            }
        }
        const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
        return { data, total };
    }

    async findOne(id: number) {
        // Usamos findOne con 'where' y 'relations' para cargar también los items de factura
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['invoiceItems', 'invoiceItems.invoice', 'invoiceItems.invoice.customer'], // Cargamos la cadena completa de relaciones
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.findOne(id);
        this.productsRepository.merge(product, updateProductDto);
        return this.productsRepository.save(product);
    }

    async remove(id: number) {
        const product = await this.findOne(id);
        return this.productsRepository.remove(product);
    }
}
