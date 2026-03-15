import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.create(dto);
  }

  @Get()
  findAll(@Query('productId') productId?: string) {
    const filters =
      productId != null && productId !== ''
        ? { productId: parseInt(productId, 10) }
        : undefined;
    return this.stockMovementsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(+id);
  }
}
