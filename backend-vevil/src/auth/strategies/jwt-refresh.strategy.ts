import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../auth.controller';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      // Extraer JWT desde header Authorization, cookie o body
      jwtFromRequest: (req: Request) => {
        // Primero intentar desde header Authorization (Bearer token)
        const authHeader = req?.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        // Segundo: desde cookie
        if (req && req.cookies && req.cookies[REFRESH_TOKEN_COOKIE]) {
          return req.cookies[REFRESH_TOKEN_COOKIE];
        }
        // Fallback: desde body (compatibilidad con clientes antiguos)
        return req.body?.refresh_token;
      },
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // Pasamos el request al callback de validate
    });
  }

  validate(req: Request, payload: any) {
    // Extraer refresh token desde header, cookie o body
    const refreshToken =
      req.headers?.authorization?.substring(7) ||
      req.cookies?.[REFRESH_TOKEN_COOKIE] ||
      req.body?.refresh_token;
    return { ...payload, refreshToken };
  }
}