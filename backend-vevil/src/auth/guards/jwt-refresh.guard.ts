import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Este guard simplemente invoca la estrategia 'jwt-refresh' que ya hemos creado.
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}