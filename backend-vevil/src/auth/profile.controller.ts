import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '@/users/entities/user-role.enum';


@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@Request() req) {
    // Ruta protegida para cualquier usuario autenticado
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // Solo usuarios con el rol 'ADMIN' pueden acceder
  @Get('admin')
  getAdminProfile(@Request() req) {
    return {
      message: '¡Bienvenido, administrador!',
      user: req.user,
    };
  }
}