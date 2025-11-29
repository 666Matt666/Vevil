// c:\Workspace\Vevil\vevil-system\backend-vevil\src\users\users.module.ts

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; // <--- 1. Importa CacheModule
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(), // <--- 2. Añádelo al array de imports
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
