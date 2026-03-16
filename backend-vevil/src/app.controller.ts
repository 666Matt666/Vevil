import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Health check para Render, load balancers o scripts de dev. GET /api/health */
  @Get('health')
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}