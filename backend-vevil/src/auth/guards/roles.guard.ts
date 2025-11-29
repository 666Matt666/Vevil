import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Ruta relativa dentro del mismo módulo
import { UserRole } from '@/users/entities/user-role.enum'; // Ruta con alias para otro módulo
import { User } from '@/users/user.entity'; // Ruta con alias para otro módulo

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso.
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // Si no hay usuario en la solicitud, no se permite el acceso.
    }
    return requiredRoles.some((role) => user.role === role);
  }
}