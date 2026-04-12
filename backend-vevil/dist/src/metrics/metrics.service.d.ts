import { Repository } from 'typeorm';
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
    lowStockList: {
        id: number;
        name: string;
        stock: number;
        minStock: number;
    }[];
    topProductsSold: {
        productId: number;
        productName: string;
        quantitySold: number;
    }[];
    periodFrom?: string;
    periodTo?: string;
    periodRevenue?: number;
    periodInvoices?: number;
    periodTopProducts?: {
        productId: number;
        productName: string;
        quantitySold: number;
    }[];
    generatedAt: string;
}
export declare class MetricsService {
    private readonly productRepo;
    private readonly customerRepo;
    private readonly invoiceRepo;
    private readonly invoiceItemRepo;
    private readonly lowStockThreshold;
    constructor(productRepo: Repository<Product>, customerRepo: Repository<Customer>, invoiceRepo: Repository<Invoice>, invoiceItemRepo: Repository<InvoiceItem>);
    getDashboardMetrics(filters?: {
        from?: string;
        to?: string;
    }): Promise<DashboardMetrics>;
    getDailyRevenue(days?: number): Promise<{
        date: string;
        revenue: number;
    }[]>;
    private getTotalRevenue;
    private getRevenueSince;
    private getRevenueBetween;
    private getTopProductsSold;
    private getTopProductsSoldBetween;
    private getLowStockProducts;
}
