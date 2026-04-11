import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    create(createCustomerDto: CreateCustomerDto) {
        const customer = this.customersRepository.create(createCustomerDto);
        return this.customersRepository.save(customer);
    }

    findAll() {
        return this.customersRepository.find();
    }

    async findPage(
        page: number = 1,
        limit: number = 10,
        filters?: { search?: string; department?: string },
    ): Promise<{ data: Customer[]; total: number }> {
        const skip = Math.max(0, (page - 1) * limit);
        const take = Math.min(100, Math.max(1, limit));
        const qb = this.customersRepository.createQueryBuilder('c').orderBy('c.id', 'ASC');
        if (filters?.search?.trim()) {
            const term = `%${filters.search.trim().toLowerCase()}%`;
            qb.andWhere(
                '(LOWER(c.name) LIKE :term OR LOWER(c.email) LIKE :term OR LOWER(c.tax_id) LIKE :term)',
                { term },
            );
        }
        if (filters?.department?.trim()) {
            qb.andWhere('c.address_province = :dept', { dept: filters.department.trim() });
        }
        const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
        return { data, total };
    }

    async getDepartments(): Promise<string[]> {
        const rows = await this.customersRepository
            .createQueryBuilder('c')
            .select('DISTINCT c.address_province', 'department')
            .where('c.address_province IS NOT NULL AND c.address_province != \'\'')
            .orderBy('c.address_province', 'ASC')
            .getRawMany<{ department: string }>();
        return rows.map((r) => r.department).filter(Boolean);
    }

    async findOne(id: number) {
        const customer = await this.customersRepository.findOneBy({ id });
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }

    async update(id: number, updateCustomerDto: UpdateCustomerDto) {
        const customer = await this.findOne(id);
        this.customersRepository.merge(customer, updateCustomerDto);
        return this.customersRepository.save(customer);
    }

    async remove(id: number) {
        const customer = await this.findOne(id);
        
        // Check for associated invoices using raw query
        const result = await this.customersRepository.query(
            'SELECT COUNT(*) as count FROM "invoice" WHERE "customerId" = $1',
            [id]
        );
        const invoiceCount = parseInt(result[0]?.count || '0', 10);
        if (invoiceCount > 0) {
            throw new BadRequestException(`No se puede eliminar: hay ${invoiceCount} factura(s) asociada(s)`);
        }
        
        return this.customersRepository.remove(customer);
    }
}
