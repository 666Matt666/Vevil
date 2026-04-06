import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DevJwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
