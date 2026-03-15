import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/users/user.entity';
import { UserRole } from '@/users/entities/user-role.enum';
import { PendingRegistrationsService } from './pending-registrations.service';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { PendingRegistration } from './pending-registration.entity';

@ApiTags('Pending Registrations')
@Controller('pending-registrations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class PendingRegistrationsController {
  constructor(private readonly service: PendingRegistrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes pendientes de aprobación (solo Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes.' })
  findAllPending(): Promise<PendingRegistration[]> {
    return this.service.findAllPending();
  }

  @Get('count')
  @ApiOperation({ summary: 'Cantidad de solicitudes pendientes (para notificación)' })
  @ApiResponse({ status: 200, description: 'Número de solicitudes pendientes.' })
  async countPending(): Promise<{ count: number }> {
    const count = await this.service.countPending();
    return { count };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Aprobar solicitud y asignar perfil (solo Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario aprobado, se envió email para crear contraseña.' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada.' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveRegistrationDto,
    @GetUser() _user: User,
  ) {
    return this.service.approve(id, dto.role);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Rechazar solicitud (solo Admin)' })
  @ApiResponse({ status: 200, description: 'Solicitud rechazada.' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada.' })
  reject(@Param('id') id: string, @GetUser() _user: User) {
    return this.service.reject(id);
  }
}
