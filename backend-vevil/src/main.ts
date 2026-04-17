import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { AllExceptionsFilter } from './http-exception.filter';

// Helper: Construye lista de orígenes permitidos
function buildCorsOrigins(): (string | RegExp)[] {
  const defaultOrigins: (string | RegExp)[] = [
    /^http:\/\/localhost(:\d+)?$/,
    /^https:\/\/[^.]+\.vercel\.app$/,
    /\.vercel\.dev$/,
    'https://vevil-dtt7ta.fly.dev',
    'https://vevil-qa.fly.dev',
  ];
  
  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  
  return [...envOrigins, ...defaultOrigins];
}

// Helper: Verifica si un origen está permitido
function isOriginAllowed(
  origin: string,
  allowedOrigins: (string | RegExp)[],
): boolean {
  return allowedOrigins.some((allowed) => {
    if (typeof allowed === 'string') {
      return allowed === origin;
    }
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  });
}

async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');
    
    if (process.env.NODE_ENV !== 'production') {
      logger.log('Iniciando aplicación Vevil...');
    } else {
      logger.log('Iniciando en PRODUCCIÓN...');
    }
    
    const app = await NestFactory.create(AppModule);

    // Middleware para parsear cookies (necesario para HttpOnly cookies)
    app.use(cookieParser());
    
    // Security headers (debe ir temprano en el middleware chain)
    const securityHeadersMiddleware = new SecurityHeadersMiddleware();
    app.use(securityHeadersMiddleware.use.bind(securityHeadersMiddleware));

    // Configuración de CORS - whitelist explícita para seguridad
    const corsOrigins = buildCorsOrigins();
    
    app.enableCors({
      origin: (requestOrigin, callback) => {
        // Si no hay origin (como en requests de servidor), permitir
        if (!requestOrigin) {
          return callback(null, true);
        }
        
        // Verificar contra whitelist
        const isAllowed = isOriginAllowed(requestOrigin, corsOrigins);
        if (isAllowed) {
          callback(null, true);
        } else {
          logger.warn(`CORS: Origen bloqueado - ${requestOrigin}`);
          callback(new Error('Origin not allowed'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
    });

    // Log de peticiones (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      app.use((req: any, _res, next) => {
        const origin = req.headers?.origin ?? req.headers?.Origin ?? '(none)';
        logger.debug(`${req.method} ${req.url} | Origin: ${origin}`);
        next();
      });
    }

    // Prefijo global para la API
    app.setGlobalPrefix('api');

    // Validación global de DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Filtro global de excepciones
    app.useGlobalFilters(new AllExceptionsFilter());

    // Configuración de Swagger (documentación de API)
    const config = new DocumentBuilder()
      .setTitle('Vevil API')
      .setDescription('API del sistema Vevil')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Puerto configurable para producción (Render usa PORT)
    const port = process.env.PORT || 3000;
    // Escuchar en todas las interfaces (0.0.0.0) para permitir acceso desde otros dispositivos
    await app.listen(port, '0.0.0.0');

    logger.log('Aplicación iniciada correctamente');
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`Servidor en http://localhost:${port}`);
      logger.log(`Swagger: http://localhost:${port}/api/docs`);
    } else {
      logger.log(`Servidor en puerto ${port}`);
    }
  } catch (error) {
    const errorLogger = new Logger('BootstrapError');
    errorLogger.error(`Error al iniciar la aplicación: ${(error as Error).message}`);

    // Mensajes de ayuda según el tipo de error
    const errorMessage = (error as Error).message || '';
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Connection refused')) {
      errorLogger.error('\n💡 PROBLEMA: No se puede conectar a la base de datos');
      errorLogger.error('   Soluciones posibles:');
      errorLogger.error('   1. Verifica que PostgreSQL esté corriendo (docker-compose up -d)');
      errorLogger.error('   2. Verifica las variables de entorno (DB_HOST, DB_PORT, etc.)');
      errorLogger.error('   3. Verifica que el host y puerto sean correctos');
    } else if (errorMessage.includes('password authentication failed')) {
      errorLogger.error('\n💡 PROBLEMA: Autenticación fallida');
      errorLogger.error('   Soluciones posibles:');
      errorLogger.error('   1. Verifica DB_USERNAME y DB_PASSWORD en las variables de entorno');
      errorLogger.error('   2. Verifica que las credenciales coincidan con tu base de datos');
    } else if (errorMessage.includes('Variables de entorno faltantes')) {
      errorLogger.error('\n💡 PROBLEMA: Faltan variables de entorno requeridas');
      errorLogger.error('   Soluciones posibles:');
      errorLogger.error('   1. Crea un archivo .env con las variables necesarias');
      errorLogger.error('   2. Configura las variables en tu plataforma de despliegue');
      errorLogger.error('   3. Revisa el archivo .env.example para ver qué variables necesitas');
    }

    process.exit(1);
  }
}
bootstrap();
