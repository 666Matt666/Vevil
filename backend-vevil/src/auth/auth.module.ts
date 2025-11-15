import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    UsersModule, // Importamos UsersModule para poder usar UsersService
    PassportModule,
    ConfigModule, // Importamos ConfigModule para leer las variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Usamos un valor directo para evitar el conflicto de tipos
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // Estrategia para login con email/password
    JwtStrategy, // Estrategia para validar Access Tokens
    JwtRefreshStrategy, // Estrategia para validar Refresh Tokens
  ],
  exports: [AuthService], // Exportamos AuthService para que pueda ser usado en otros módulos si es necesario
})
export class AuthModule {}
