import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          autoLoadEntities: true,
          synchronize: false, // <-- CAMBIO CRÍTICO: No queremos que el seed borre la BD
          // Configuración SSL necesaria para Supabase
          ssl: dbHost.includes('supabase.co') ? {
            rejectUnauthorized: false // Necesario para conexiones SSL de Supabase
          } : false,
        };
      },
    }),
    // ProductsModule, // Ya no es necesario importarlo porque es global
    CustomersModule,
    InvoicesModule,
  ],
})
export class SeedModule {}