import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DevJwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
