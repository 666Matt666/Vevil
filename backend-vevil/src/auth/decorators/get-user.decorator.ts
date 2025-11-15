import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/users/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    // El objeto 'user' se adjunta al request en la estrategia de JWT (jwt.strategy.ts)
    // después de validar el token.
    return request.user;
  },
);