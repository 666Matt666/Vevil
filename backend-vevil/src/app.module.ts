import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
// import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // Sirve los archivos estáticos de la carpeta 'uploads'
    ServeStaticModule.forRoot({
      // La ruta a la carpeta que queremos servir. `join` crea una ruta absoluta.
      rootPath: join(__dirname, '..', 'uploads'),
      // El prefijo de la URL desde el cual se servirán los archivos.
      serveRoot: '/uploads',
    }),

    // Carga las variables de entorno de forma global desde el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configura la conexión a la base de datos usando las variables cargadas
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        // La propiedad 'autoLoadEntities: true' es la forma moderna y recomendada
        // para que TypeORM descubra automáticamente las entidades que se registran
        // en los módulos (como User en UsersModule).
        autoLoadEntities: true,
        synchronize: true, // ¡Solo para desarrollo! Crea/actualiza las tablas automáticamente.
      }),
    }),

    // El módulo de usuarios que generaste previamente
    UsersModule,

    AuthModule,

    // ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}