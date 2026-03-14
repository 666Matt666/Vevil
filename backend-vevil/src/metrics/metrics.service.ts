import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';

export interface DashboardMetrics {
  totalProducts: number;
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  revenueLast7Days: number;
  invoicesLast7Days: number;
  revenueThisMonth: number;
  invoicesThisMonth: number;
  revenueLastMonth: number;
  invoicesLastMonth: number;
  lowStockProducts: number;
  lowStockList: { id: number; name: string; stock: number }[];
  topProductsSold: { productId: number; productName: string; quantitySold: number }[];
  /** Si se envió filtro from/to */
  periodFrom?: string;
  periodTo?: string;
  periodRevenue?: number;
  periodInvoices?: number;
  periodTopProducts?: { productId: number; productName: string; quantitySold: number }[];
  generatedAt: string;
}

@Injectable()
export class MetricsService {
  private readonly lowStockThreshold =
    parseInt(process.env.LOW_STOCK_THRESHOLD || '50', 10) || 50;

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepo: Repository<InvoiceItem>,
  ) {}

  async getDashboardMetrics(filters?: { from?: string; to?: string }): Promise<DashboardMetrics> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [
      totalProducts,
      totalCustomers,
      totalInvoices,
      totalRevenue,
      invoicesLast7Days,
      revenueLast7Days,
      invoicesThisMonth,
      revenueThisMonth,
      invoicesLastMonth,
      revenueLastMonth,
      lowStockList,
      topProductsSold,
    ] = await Promise.all([
      this.productRepo.count(),
      this.customerRepo.count(),
      this.invoiceRepo.count(),
      this.getTotalRevenue(),
      this.invoiceRepo.count({ where: { date: MoreThanOrEqual(sevenDaysAgo) } }),
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

    const result: DashboardMetrics = {
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

  private async getTotalRevenue(): Promise<number> {
    const result = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    return parseFloat(result?.sum || '0');
  }

  private async getRevenueSince(since: Date): Promise<number> {
    const result = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total), 0)', 'sum')
      .where('invoice.date >= :since', { since })
      .getRawOne<{ sum: string }>();
    return parseFloat(result?.sum || '0');
  }

  private async getRevenueBetween(from: Date, to: Date): Promise<number> {
    const result = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total), 0)', 'sum')
      .where('invoice.date >= :from AND invoice.date <= :to', { from, to })
      .getRawOne<{ sum: string }>();
    return parseFloat(result?.sum || '0');
  }

  private async getTopProductsSold(days: number): Promise<
    { productId: number; productName: string; quantitySold: number }[]
  > {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.getTopProductsSoldBetween(since, new Date());
  }

  private async getTopProductsSoldBetween(from: Date, to: Date): Promise<
    { productId: number; productName: string; quantitySold: number }[]
  > {
    const rows = await this.invoiceItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.invoice', 'inv')
      .innerJoin('item.product', 'p')
      .select('item.productId', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .where('inv.date >= :from AND inv.date <= :to', { from, to })
      .groupBy('item.productId')
      .addGroupBy('p.name')
      .orderBy('quantitySold', 'DESC')
      .limit(10)
      .getRawMany<{ productId: number; productName: string; quantitySold: string }>();
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      quantitySold: parseInt(r.quantitySold || '0', 10),
    }));
  }

  private async getLowStockProducts(): Promise<
    { id: number; name: string; stock: number }[]
  > {
    const products = await this.productRepo.find({
      where: {},
      select: ['id', 'name', 'stock'],
    });
    return products
      .filter((p) => p.stock < this.lowStockThreshold)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock }));
  }
}
