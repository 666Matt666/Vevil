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
      // Extraer JWT desde cookie o body (fallback para compatibilidad)
      jwtFromRequest: (req: Request) => {
        // Primero intentar desde cookie
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
    // Extraer refresh token desde cookie o body
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refresh_token;
    return { ...payload, refreshToken };
  }
}