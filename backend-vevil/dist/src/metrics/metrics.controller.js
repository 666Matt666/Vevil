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
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const metrics_service_1 = require("./metrics.service");
let MetricsController = class MetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getMetrics(from, to) {
        return this.metricsService.getDashboardMetrics(from && to ? { from, to } : undefined);
    }
    async getDailyRevenue(days) {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.metricsService.getDailyRevenue(Math.min(daysNum, 365));
    }
    async getProductProfits(days) {
        const daysNum = days ? parseInt(days, 10) : 90;
        return this.metricsService.getProductProfits(Math.min(daysNum, 365));
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener métricas del dashboard y controles' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Fecha inicio (YYYY-MM-DD) para filtro de período' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Fecha fin (YYYY-MM-DD) para filtro de período' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Métricas calculadas.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado.' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('daily-revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener ingresos diarios para gráficos' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Número de días (default 30)', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array de ingresos por día.' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getDailyRevenue", null);
__decorate([
    (0, common_1.Get)('product-profits'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener ganancias por producto' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Días hacia atrás (default 90)', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ganancias por producto.' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getProductProfits", null);
exports.MetricsController = MetricsController = __decorate([
    (0, common_1.Controller)('metrics'),
    (0, swagger_1.ApiTags)('Métricas'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map