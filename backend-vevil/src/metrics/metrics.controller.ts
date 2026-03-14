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
}
