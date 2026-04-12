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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
const customer_entity_1 = require("../customers/customer.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const invoice_item_entity_1 = require("../invoices/invoice-item.entity");
let MetricsService = class MetricsService {
    constructor(productRepo, customerRepo, invoiceRepo, invoiceItemRepo) {
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
        this.invoiceRepo = invoiceRepo;
        this.invoiceItemRepo = invoiceItemRepo;
        this.lowStockThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '50', 10) || 50;
    }
    async getDashboardMetrics(filters) {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const [totalProducts, totalCustomers, totalInvoices, totalRevenue, invoicesLast7Days, revenueLast7Days, invoicesThisMonth, revenueThisMonth, invoicesLastMonth, revenueLastMonth, lowStockList, topProductsSold,] = await Promise.all([
            this.productRepo.count(),
            this.customerRepo.count(),
            this.invoiceRepo.count(),
            this.getTotalRevenue(),
            this.invoiceRepo.count({ where: { date: (0, typeorm_2.MoreThanOrEqual)(sevenDaysAgo) } }),
            this.getRevenueSince(sevenDaysAgo),
            this.invoiceRepo
                .createQueryBuilder('i')
                .where('i.date >= :start', { start: startOfThisMonth })
                .getCount(),
            this.getRevenueSince(startOfThisMonth),
            this.invoiceRepo
                .createQueryBuilder('i')
                .where('i.date >= :start AND i.date <= :end', {
                start: startOfLastMonth,
                end: endOfLastMonth,
            })
                .getCount(),
            this.getRevenueBetween(startOfLastMonth, endOfLastMonth),
            this.getLowStockProducts(),
            this.getTopProductsSold(90),
        ]);
        const result = {
            totalProducts,
            totalCustomers,
            totalInvoices,
            totalRevenue,
            revenueLast7Days,
            invoicesLast7Days,
            revenueThisMonth,
            invoicesThisMonth,
            revenueLastMonth,
            invoicesLastMonth,
            lowStockProducts: lowStockList.length,
            lowStockList,
            topProductsSold,
            generatedAt: now.toISOString(),
        };
        if (filters?.from && filters?.to) {
            const from = new Date(filters.from);
            const to = new Date(filters.to);
            if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
                to.setHours(23, 59, 59, 999);
                const [periodRevenue, periodInvoices, periodTopProducts] = await Promise.all([
                    this.getRevenueBetween(from, to),
                    this.invoiceRepo
                        .createQueryBuilder('i')
                        .where('i.date >= :from AND i.date <= :to', { from, to })
                        .getCount(),
                    this.getTopProductsSoldBetween(from, to),
                ]);
                result.periodFrom = filters.from;
                result.periodTo = filters.to;
                result.periodRevenue = periodRevenue;
                result.periodInvoices = periodInvoices;
                result.periodTopProducts = periodTopProducts;
            }
        }
        return result;
    }
    async getDailyRevenue(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        const rows = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select("TO_CHAR(invoice.date, 'YYYY-MM-DD')", 'date')
            .addSelect('COALESCE(SUM(invoice.total), 0)', 'revenue')
            .where('invoice.date >= :since AND invoice.date <= :to', { since, to })
            .groupBy("TO_CHAR(invoice.date, 'YYYY-MM-DD')")
            .orderBy('date', 'ASC')
            .getRawMany();
        return rows.map(r => ({
            date: r.date,
            revenue: parseFloat(r.revenue || '0'),
        }));
    }
    async getTotalRevenue() {
        const result = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COALESCE(SUM(invoice.total), 0)', 'sum')
            .getRawOne();
        return parseFloat(result?.sum || '0');
    }
    async getRevenueSince(since) {
        const result = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COALESCE(SUM(invoice.total), 0)', 'sum')
            .where('invoice.date >= :since', { since })
            .getRawOne();
        return parseFloat(result?.sum || '0');
    }
    async getRevenueBetween(from, to) {
        const result = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COALESCE(SUM(invoice.total), 0)', 'sum')
            .where('invoice.date >= :from AND invoice.date <= :to', { from, to })
            .getRawOne();
        return parseFloat(result?.sum || '0');
    }
    async getTopProductsSold(days) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.getTopProductsSoldBetween(since, new Date());
    }
    async getTopProductsSoldBetween(from, to) {
        const rows = await this.invoiceItemRepo
            .createQueryBuilder('item')
            .innerJoin('item.invoice', 'inv')
            .innerJoin('item.product', 'p')
            .select('item.productId', 'productId')
            .addSelect('p.name', 'productName')
            .addSelect('SUM(item.quantity)', 'quantity_sold')
            .where('inv.date >= :from AND inv.date <= :to', { from, to })
            .groupBy('item.productId')
            .addGroupBy('p.name')
            .orderBy('quantity_sold', 'DESC')
            .limit(10)
            .getRawMany();
        return rows.map((r) => ({
            productId: r.productId,
            productName: r.productName,
            quantitySold: parseInt(r.quantity_sold || '0', 10),
        }));
    }
    async getLowStockProducts() {
        const products = await this.productRepo.find({
            where: {},
            select: ['id', 'name', 'stock', 'minStock'],
        });
        return products
            .filter((p) => {
            const threshold = p.minStock != null && p.minStock > 0 ? p.minStock : this.lowStockThreshold;
            return p.stock < threshold;
        })
            .map((p) => ({ id: p.id, name: p.name, stock: p.stock, minStock: p.minStock ?? 0 }));
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map