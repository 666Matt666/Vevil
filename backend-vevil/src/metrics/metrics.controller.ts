import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService, DashboardMetrics } from './metrics.service';

@Controller('metrics')
@ApiTags('Métricas')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener métricas del dashboard y controles' })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha inicio (YYYY-MM-DD) para filtro de período' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha fin (YYYY-MM-DD) para filtro de período' })
  @ApiResponse({ status: 200, description: 'Métricas calculadas.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getMetrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<DashboardMetrics> {
    return this.metricsService.getDashboardMetrics(
      from && to ? { from, to } : undefined,
    );
  }

  @Get('daily-revenue')
  @ApiOperation({ summary: 'Obtener ingresos diarios para gráficos' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de días (default 30)', type: Number })
  @ApiResponse({ status: 200, description: 'Array de ingresos por día.' })
  async getDailyRevenue(
    @Query('days') days?: string,
  ): Promise<{ date: string; revenue: number }[]> {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.metricsService.getDailyRevenue(Math.min(daysNum, 365));
  }

  @Get('product-profits')
  @ApiOperation({ summary: 'Obtener ganancias por producto' })
  @ApiQuery({ name: 'days', required: false, description: 'Días hacia atrás (default 90)', type: Number })
  @ApiResponse({ status: 200, description: 'Ganancias por producto.' })
  async getProductProfits(
    @Query('days') days?: string,
  ): Promise<{
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
    marginPercent: number;
  }[]> {
    const daysNum = days ? parseInt(days, 10) : 90;
    return this.metricsService.getProductProfits(Math.min(daysNum, 365));
  }
}
