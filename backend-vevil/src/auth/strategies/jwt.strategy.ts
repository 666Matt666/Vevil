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
        // Primero intentar desde cookie
        if (req && req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
          return req.cookies[ACCESS_TOKEN_COOKIE];
        }
        // Fallback: desde header Authorization (Bearer token)
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