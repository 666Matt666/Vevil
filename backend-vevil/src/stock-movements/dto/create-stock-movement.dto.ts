import { IsInt, IsEnum, IsOptional, IsString, Min } from 'class-validator';

export type StockMovementReasonDto =
  | 'purchase'
  | 'adjustment_in'
  | 'adjustment_out';

export class CreateStockMovementDto {
  @IsInt()
  productId: number;

  /** 'in' = entrada (compra, ajuste positivo), 'out' = salida (ajuste negativo) */
  @IsEnum(['in', 'out'])
  type: 'in' | 'out';

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(['purchase', 'adjustment_in', 'adjustment_out'])
  reason: StockMovementReasonDto;

  @IsOptional()
  @IsString()
  note?: string;
}
