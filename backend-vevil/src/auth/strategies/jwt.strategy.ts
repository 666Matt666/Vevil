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
      // Extraer JWT desde cookie O header Authorization (prioridad al header)
      jwtFromRequest: (req: Request) => {
        // Primero intentar desde header Authorization (Bearer token)
        const authHeader = req?.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          console.log('[JWT Strategy] Token from header:', token.substring(0, 20) + '...');
          return token;
        }
        // Fallback: desde cookie
        if (req && req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
          console.log('[JWT Strategy] Token from cookie:', req.cookies[ACCESS_TOKEN_COOKIE].substring(0, 20) + '...');
          return req.cookies[ACCESS_TOKEN_COOKIE];
        }
        // Último fallback: desde header Authorization
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('[JWT Strategy] Payload validated:', payload);
    return { id: payload.sub, email: payload.username, role: payload.role };
  }
}