import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; // 1. Importamos la entidad
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 2. Registramos la entidad para que pueda ser inyectada en el servicio
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 3. Exportamos el servicio para que otros módulos puedan usarlo
})
export class UsersModule {}