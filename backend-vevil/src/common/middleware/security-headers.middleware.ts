import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    // Previne que el navegador MIME-sniff la respuesta
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Protege contra clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Habilita protección XSS en navegadores antiguos
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Controla qué información de referrer se envía
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy - ajustar según necesidades
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://vevil-dtt7ta.fly.dev https://vevil-qa.fly.dev;"
      );
    }
    
    // HSTS solo en HTTPS (producción)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
  }
}
