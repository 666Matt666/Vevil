import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
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

    async remove(id: number, force: boolean = false) {
        const customer = await this.findOne(id);
        
        // Get associated invoices
        const invoices = await this.invoicesRepository.find({ where: { customerId: id } });
        
        if (invoices.length > 0 && !force) {
            // Return invoice info so frontend can decide
            return {
                cannotDelete: true,
                message: `El cliente tiene ${invoices.length} factura(s) asociada(s)`,
                invoices: invoices.map(inv => ({
                    id: inv.id,
                    number: inv.id, // Could use invoice number if available
                    date: inv.date,
                    total: inv.total,
                    status: inv.status,
                })),
            };
        }
        
        // Delete invoices if force=true
        if (force && invoices.length > 0) {
            for (const inv of invoices) {
                await this.invoicesRepository.delete(inv.id);
            }
        }
        
        return this.customersRepository.remove(customer);
    }
}
