import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private suppliersRepository: Repository<Supplier>,
    ) {}

    async findAll(): Promise<Supplier[]> {
        return this.suppliersRepository.find({ 
            order: { name: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Supplier | null> {
        return this.suppliersRepository.findOne({ where: { id } });
    }

    async create(data: Partial<Supplier>): Promise<Supplier> {
        const supplier = this.suppliersRepository.create(data);
        return this.suppliersRepository.save(supplier);
    }

    async update(id: number, data: Partial<Supplier>): Promise<Supplier | null> {
        await this.suppliersRepository.update(id, { ...data, updated_at: new Date() });
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.suppliersRepository.delete(id);
    }
}