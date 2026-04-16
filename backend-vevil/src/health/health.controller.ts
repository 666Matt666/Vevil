import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const databaseStatus = await this.health.check(() => this.dataSource.initialize());
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus.database ? 'up' : 'down',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
