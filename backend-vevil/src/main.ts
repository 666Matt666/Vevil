import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
// import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Se desactiva temporalmente el filtro global para diagnosticar el error de arranque.
  // El manejador de errores por defecto de NestJS se usará en su lugar.
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Vevil System API')
    .setDescription('La documentación de la API para el sistema Vevil')
    .setVersion('1.0')
    .addBearerAuth() // ¡Importante! Esto añade el candado para la autenticación JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // La documentación estará disponible en /api-docs

  await app.listen(3000);
}
bootstrap();