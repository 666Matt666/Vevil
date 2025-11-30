import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS - permitir acceso desde cualquier origen
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.vercel\.app$/, // Permite cualquier subdominio de Vercel
        /\.vercel\.dev$/, // Permite preview deployments de Vercel
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

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
  
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`🌐 Accesible en http://localhost:${port} y http://192.168.1.38:${port}`);
  console.log(`📚 Documentación disponible en /api/docs`);
}
bootstrap();
