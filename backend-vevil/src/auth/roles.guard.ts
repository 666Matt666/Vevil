import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/user.entity';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso
    }
    const { user } = context.switchToHttp().getRequest();

    // Comprueba si el rol único del usuario está incluido en los roles requeridos.
    // Esto funciona tanto si user.role es un string como si es un array.
    return requiredRoles.some((role) => user.role === role);
  }
}