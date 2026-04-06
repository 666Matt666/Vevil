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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_movement_entity_1 = require("./stock-movement.entity");
const products_service_1 = require("../products/products.service");
let StockMovementsService = class StockMovementsService {
    constructor(movementRepo, productsService) {
        this.movementRepo = movementRepo;
        this.productsService = productsService;
    }
    async create(dto) {
        const product = await this.productsService.findOne(dto.productId);
        const currentStock = product.stock;
        const qty = dto.quantity;
        if (dto.type === 'in') {
            await this.productsService.update(product.id, {
                stock: currentStock + qty,
            });
        }
        else {
            if (currentStock < qty) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}. Actual: ${currentStock}, solicitado: ${qty}`);
            }
            await this.productsService.update(product.id, {
                stock: currentStock - qty,
            });
        }
        const movement = this.movementRepo.create({
            productId: product.id,
            product,
            type: dto.type,
            quantity: qty,
            reason: dto.reason,
            note: dto.note ?? null,
            invoiceId: null,
        });
        return this.movementRepo.save(movement);
    }
    async recordSale(productId, quantity, invoiceId) {
        const product = await this.productsService.findOne(productId);
        const movement = this.movementRepo.create({
            productId: product.id,
            product,
            type: 'out',
            quantity,
            reason: 'sale',
            note: null,
            invoiceId,
        });
        return this.movementRepo.save(movement);
    }
    async findAll(filters) {
        const qb = this.movementRepo
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.product', 'product')
            .orderBy('m.createdAt', 'DESC');
        if (filters?.productId != null) {
            qb.andWhere('m.productId = :productId', { productId: filters.productId });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const m = await this.movementRepo.findOne({
            where: { id },
            relations: ['product'],
        });
        if (!m)
            throw new common_1.NotFoundException(`Movimiento ${id} no encontrado`);
        return m;
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, products_service_1.ProductsService])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map