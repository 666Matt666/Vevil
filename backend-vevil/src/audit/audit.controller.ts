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
  @ApiQuery({ name: 'offset', required: false, description: 'Desplazamiento para paginación' })
  @ApiResponse({ status: 200, description: 'Lista de registros de auditoría' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitStr || '50', 10) || 50, 1), 200);
    const offset = Math.max(0, parseInt(offsetStr || '0', 10) || 0);

    if (userId) {
      const data = await this.auditService.findByUser(userId, limit);
      const total = await this.auditService.getTotalCount({ userId });
      return { data, total };
    }
    if (entityType && entityId) {
      const data = await this.auditService.findByEntity(entityType, entityId, limit);
      const total = await this.auditService.getTotalCount({ entityType, entityId });
      return { data, total };
    }
    const data = await this.auditService.findRecent(limit, offset);
    const total = await this.auditService.getTotalCount();
    return { data, total };
  }
}
