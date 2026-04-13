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
exports.ClientAuthController = void 0;
const common_1 = require("@nestjs/common");
const client_users_service_1 = require("./client-users.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../invoices/invoice.entity");
let ClientAuthController = class ClientAuthController {
    constructor(clientUsersService, invoicesRepository) {
        this.clientUsersService = clientUsersService;
        this.invoicesRepository = invoicesRepository;
    }
    async register(body) {
        const user = await this.clientUsersService.register(body.email, body.password, body.customerId);
        if (body.name) {
            user.name = body.name;
            await this.clientUsersService.updateName(user.id, body.name);
        }
        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        return {
            success: true,
            token,
            user: { id: user.id, email: user.email, name: body.name || user.name }
        };
    }
    async login(body) {
        const user = await this.clientUsersService.validate(body.email, body.password);
        if (!user) {
            return { success: false, error: 'Email o contraseña incorrectos' };
        }
        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        return {
            success: true,
            token,
            user: { id: user.id, email: user.email, name: user.name, customerId: user.customerId }
        };
    }
    async getMe(authHeader) {
        if (!authHeader) {
            return { error: 'No autorizado' };
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = Buffer.from(token, 'base64').toString();
            const [id] = decoded.split(':');
            const user = await this.clientUsersService.findById(parseInt(id));
            if (!user) {
                return { error: 'Usuario no encontrado' };
            }
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                customerId: user.customerId
            };
        }
        catch {
            return { error: 'Token inválido' };
        }
    }
    async getInvoices(authHeader) {
        if (!authHeader) {
            return { error: 'No autorizado', invoices: [] };
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = Buffer.from(token, 'base64').toString();
            const [id] = decoded.split(':');
            const user = await this.clientUsersService.findById(parseInt(id));
            if (!user) {
                return { error: 'Usuario no encontrado', invoices: [] };
            }
            const invoices = await this.invoicesRepository.find({
                where: { customer: { email: user.email } },
                relations: ['customer', 'items', 'items.product'],
                order: { date: 'DESC' },
            });
            return {
                invoices: invoices.map(inv => ({
                    id: inv.id,
                    date: inv.date,
                    total: inv.total,
                    currency: inv.currency,
                    status: inv.status,
                    items: inv.items?.map(item => ({
                        productName: item.product?.name || `Producto #${item.productId}`,
                        quantity: item.quantity,
                        price: item.priceAtSale,
                        total: Number(item.priceAtSale) * item.quantity,
                    })) || [],
                })),
            };
        }
        catch {
            return { error: 'Token inválido', invoices: [] };
        }
    }
};
exports.ClientAuthController = ClientAuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientAuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientAuthController.prototype, "getInvoices", null);
exports.ClientAuthController = ClientAuthController = __decorate([
    (0, common_1.Controller)('api/client'),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [client_users_service_1.ClientUsersService,
        typeorm_2.Repository])
], ClientAuthController);
//# sourceMappingURL=client-auth.controller.js.map