import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/scheduler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppSeedService } from './app-seed.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MetricsModule } from './metrics/metrics.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { MailModule } from './mail/mail.module';
import { PendingRegistrationsModule } from './pending-registrations/pending-registrations.module';
import { WebAuthnModule } from './webauthn/webauthn.module';
import { AuditModule } from './audit/audit.module';
import { User } from './users/user.entity';
// import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    // Sirve los archivos estáticos de la carpeta 'uploads'
    ServeStaticModule.forRoot({
      // La ruta a la carpeta que queremos servir. `join` crea una ruta absoluta.
      rootPath: join(__dirname, '..', 'uploads'),
      // El prefijo de la URL desde el cual se servirán los archivos.
      serveRoot: '/uploads',
    }),

    // Carga las variables de entorno: .env y luego .env.local (local sobreescribe)
    // La validación se hace en el factory de TypeOrmModule para asegurar que la DB esté configurada
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validationSchema: null, // Usamos validación manual en el factory
    }),

    // Rate limiting global (límite por IP). Rutas sensibles definen su propio límite con @Throttle().
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 100 },   // 100 req/min por IP
    ]),

    // Configura la conexión a la base de datos usando las variables cargadas
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Valores por defecto para desarrollo local (docker-compose)
        const dbHost = configService.get<string>('DB_HOST') || 'localhost';
        const dbPort = configService.get<number>('DB_PORT') || 5432;
        const dbUsername = configService.get<string>('DB_USERNAME') || 'postgres';
        const dbPassword = configService.get<string>('DB_PASSWORD') || 'admin';
        const dbDatabase = configService.get<string>('DB_DATABASE') || 'vevil_db';

        // Validación: Verificar que las variables críticas no estén vacías (solo en producción real)
        // No validamos si estamos usando valores por defecto de desarrollo (localhost, admin, vevil_db)
        const isUsingDefaultValues = dbHost === 'localhost' && dbPassword === 'admin' && dbDatabase === 'vevil_db';
        const isProduction = (process.env.NODE_ENV === 'production' || dbHost.includes('supabase.co')) && !isUsingDefaultValues;
        
        if (isProduction) {
          const requiredVars = {
            DB_HOST: dbHost,
            DB_USERNAME: dbUsername,
            DB_PASSWORD: dbPassword,
            DB_DATABASE: dbDatabase,
          };

          const missingVars = Object.entries(requiredVars)
            .filter(([key, value]) => !value || value === 'localhost' || value === 'admin')
            .map(([key]) => key);

          if (missingVars.length > 0) {
            console.error('❌ ERROR: Variables de entorno faltantes o inválidas en producción:');
            missingVars.forEach(varName => console.error(`   - ${varName}`));
            console.error('💡 Configura estas variables en tu plataforma de despliegue (Render)');
            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('📊 Configuración de Base de Datos:');
          console.log(`   Host: ${dbHost}`);
          console.log(`   Port: ${dbPort}`);
          console.log(`   Username: ${dbUsername}`);
          console.log(`   Database: ${dbDatabase}`);
          console.log(`   SSL: ${dbHost.includes('supabase.co') ? 'Sí (Supabase)' : 'No (Local)'}`);
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          // La propiedad 'autoLoadEntities: true' es la forma moderna y recomendada
          // para que TypeORM descubra automáticamente las entidades que se registran
          // en los módulos (como User en UsersModule).
          autoLoadEntities: true,
          // No sincronizar cuando la BD es Supabase (nube), ni en producción. Solo sync con BD local en desarrollo.
          synchronize: process.env.NODE_ENV !== 'production' && !dbHost.includes('supabase.co'),
          // Configuración SSL necesaria para Supabase
          ssl: dbHost.includes('supabase.co') ? {
            rejectUnauthorized: false // Necesario para conexiones SSL de Supabase
          } : false,
          // Manejo de errores de conexión
          retryAttempts: 3,
          retryDelay: 3000,
          // Logging para debugging
          logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'migration'] : ['error'],
        };
      },
    }),

    // El módulo de usuarios que generaste previamente
    UsersModule,

    AuthModule,

    ProductsModule,

    CustomersModule,

    InvoicesModule,

    MetricsModule,

    StockMovementsModule,

    MailModule,

    PendingRegistrationsModule,
    WebAuthnModule,
    AuditModule,

    // ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppSeedService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }