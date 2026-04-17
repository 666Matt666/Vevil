import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Lista de elementos' })
  data: T[];

  @ApiProperty({ example: 100, description: 'Número total de elementos' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual', required: false })
  page?: number;

  @ApiProperty({ example: 20, description: 'Límite de elementos por página', required: false })
  limit?: number;

  @ApiProperty({ example: 5, description: 'Total de páginas', required: false })
  totalPages?: number;
}
