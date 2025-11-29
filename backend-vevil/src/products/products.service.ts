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
        const product = this.productsRepository.create(createProductDto);
        return this.productsRepository.save(product);
    }

    findAll() {
        // Usamos la opción 'relations' para cargar los items de factura asociados a cada producto
        return this.productsRepository.find({
            relations: ['invoiceItems'],
        });
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
