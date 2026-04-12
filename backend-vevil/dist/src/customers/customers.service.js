"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
let CustomersService = class CustomersService {
    constructor(customersRepository, invoicesRepository) {
        this.customersRepository = customersRepository;
        this.invoicesRepository = invoicesRepository;
    }
    create(createCustomerDto) {
        const customer = this.customersRepository.create(createCustomerDto);
        return this.customersRepository.save(customer);
    }
    findAll() {
        return this.customersRepository.find();
    }
    async findPage(page = 1, limit = 10, filters) {
        const skip = Math.max(0, (page - 1) * limit);
        const take = Math.min(100, Math.max(1, limit));
        const qb = this.customersRepository.createQueryBuilder('c').orderBy('c.id', 'ASC');
        if (filters?.search?.trim()) {
            const term = `%${filters.search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(c.name) LIKE :term OR LOWER(c.email) LIKE :term OR LOWER(c.tax_id) LIKE :term)', { term });
        }
        if (filters?.department?.trim()) {
            qb.andWhere('c.address_province = :dept', { dept: filters.department.trim() });
        }
        const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
        return { data, total };
    }
    async getDepartments() {
        const rows = await this.customersRepository
            .createQueryBuilder('c')
            .select('DISTINCT c.address_province', 'department')
            .where('c.address_province IS NOT NULL AND c.address_province != \'\'')
            .orderBy('c.address_province', 'ASC')
            .getRawMany();
        return rows.map((r) => r.department).filter(Boolean);
    }
    async findOne(id) {
        const customer = await this.customersRepository.findOneBy({ id });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, updateCustomerDto) {
        const customer = await this.findOne(id);
        this.customersRepository.merge(customer, updateCustomerDto);
        return this.customersRepository.save(customer);
    }
    async remove(id) {
        const customer = await this.findOne(id);
        const invoices = await this.invoicesRepository.find({ where: { customerId: id } });
        if (invoices.length > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el cliente porque tiene ${invoices.length} factura(s) asociada(s). Elimine las facturas primero.`);
        }
        return this.customersRepository.remove(customer);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map