import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DevJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
}
