import { Injectable, NotFoundException } from '@nestjs/common';
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
        return this.customersRepository.remove(customer);
    }
}
