import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Auditoría')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit
   * Query params:
   * - userId: filtrar por usuario
   * - entityType + entityId: filtrar por entidad
   * - limit: máximo de resultados (default 50, max 200)
   * Si no se pasa ningún filtro, devuelve los últimos registros (findRecent).
   */
  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por ID de usuario' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Tipo de entidad (invoice, customer, product, etc.)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'ID de la entidad' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de resultados (1-200, default 50)' })
  @ApiResponse({ status: 200, description: 'Lista de registros de auditoría' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limitStr?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitStr || '50', 10) || 50, 1), 200);

    if (userId) {
      return this.auditService.findByUser(userId, limit);
    }
    if (entityType && entityId) {
      return this.auditService.findByEntity(entityType, entityId, limit);
    }
    return this.auditService.findRecent(limit);
  }
}
