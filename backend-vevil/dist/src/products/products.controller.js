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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const audit_service_1 = require("../audit/audit.service");
let ProductsController = class ProductsController {
    constructor(productsService, auditService) {
        this.productsService = productsService;
        this.auditService = auditService;
    }
    userFromReq(req) {
        const u = req?.user;
        return { userId: u?.userId ?? u?.id ?? null, userEmail: u?.email ?? u?.username ?? null };
    }
    async create(createProductDto, req) {
        const created = await this.productsService.create(createProductDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.created',
            entityType: 'product',
            entityId: String(created.id),
            newValue: { name: created.name, price: created.price },
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return created;
    }
    findAll() {
        return this.productsService.findAll();
    }
    findOne(id) {
        return this.productsService.findOne(+id);
    }
    async update(id, updateProductDto, req) {
        const previous = await this.productsService.findOne(+id);
        const updated = await this.productsService.update(+id, updateProductDto);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.updated',
            entityType: 'product',
            entityId: id,
            oldValue: { name: previous.name, price: previous.price },
            newValue: updateProductDto,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return updated;
    }
    async remove(id, req) {
        const removed = await this.productsService.remove(+id);
        await this.auditService.log({
            ...this.userFromReq(req),
            action: 'product.deleted',
            entityType: 'product',
            entityId: id,
            ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
        }).catch(() => { });
        return removed;
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        audit_service_1.AuditService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map