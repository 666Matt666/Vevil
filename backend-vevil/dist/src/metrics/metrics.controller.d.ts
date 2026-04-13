import { MetricsService, DashboardMetrics } from './metrics.service';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getMetrics(from?: string, to?: string): Promise<DashboardMetrics>;
    getDailyRevenue(days?: string): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getProductProfits(days?: string): Promise<{
        productId: number;
        productName: string;
        quantitySold: number;
        revenue: number;
        cost: number;
        profit: number;
        marginPercent: number;
    }[]>;
}
