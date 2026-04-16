import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
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
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        try {
          // Simple query to verify DB connection
          await this.dataSource.initialize();
          return { status: 'up', timestamp: new Date().toISOString() };
        } catch (error) {
          return { status: 'down', error: error.message, timestamp: new Date().toISOString() };
        }
      },
    ]);
  }
}
