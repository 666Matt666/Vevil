import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚀 Iniciando aplicación Vevil...');
    }
    const app = await NestFactory.create(AppModule);

    // Configuración de CORS - permitir acceso desde cualquier origen
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : [
          /^http:\/\/localhost(:\d+)?$/, // Cualquier puerto en localhost (5173, 5174, etc.)
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
    
    console.log('✅ Aplicación iniciada correctamente');
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 Servidor en http://localhost:${port}`);
      console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
    } else {
      console.log(`🚀 Servidor en puerto ${port}`);
    }
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error.message);
    
    // Mensajes de ayuda según el tipo de error
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Connection refused')) {
      console.error('\n💡 PROBLEMA: No se puede conectar a la base de datos');
      console.error('   Soluciones posibles:');
      console.error('   1. Verifica que PostgreSQL esté corriendo (docker-compose up -d)');
      console.error('   2. Verifica las variables de entorno (DB_HOST, DB_PORT, etc.)');
      console.error('   3. Verifica que el host y puerto sean correctos');
    } else if (error.message?.includes('password authentication failed')) {
      console.error('\n💡 PROBLEMA: Autenticación fallida');
      console.error('   Soluciones posibles:');
      console.error('   1. Verifica DB_USERNAME y DB_PASSWORD en las variables de entorno');
      console.error('   2. Verifica que las credenciales coincidan con tu base de datos');
    } else if (error.message?.includes('Variables de entorno faltantes')) {
      console.error('\n💡 PROBLEMA: Faltan variables de entorno requeridas');
      console.error('   Soluciones posibles:');
      console.error('   1. Crea un archivo .env con las variables necesarias');
      console.error('   2. Configura las variables en tu plataforma de despliegue');
      console.error('   3. Revisa el archivo .env.example para ver qué variables necesitas');
    }
    
    process.exit(1);
  }
}
bootstrap();
