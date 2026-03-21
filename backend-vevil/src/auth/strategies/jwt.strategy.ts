import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth.controller';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extraer JWT desde cookie o header Authorization (fallback para compatibilidad)
      jwtFromRequest: (req: Request) => {
        // Debug: mostrar todas las cookies recibidas
        console.log('[JWT Strategy] Cookies received:', req?.cookies ? Object.keys(req.cookies) : 'no cookies');
        console.log('[JWT Strategy] All headers:', req?.headers?.cookie);
        
        // Primero intentar desde cookie
        if (req && req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
          console.log('[JWT Strategy] Found access token in cookie');
          return req.cookies[ACCESS_TOKEN_COOKIE];
        }
        // Fallback: desde header Authorization (Bearer token)
        console.log('[JWT Strategy] No cookie found, trying Authorization header');
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.username, role: payload.role };
  }
}