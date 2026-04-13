import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientAuthController } from './client-auth.controller';
import { ClientUsersService } from './client-users.service';
import { ClientUser } from './client-user.entity';
import { Invoice } from '../invoices/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClientUser, Invoice])],
    controllers: [ClientAuthController],
    providers: [ClientUsersService],
    exports: [ClientUsersService],
})
export class ClientUsersModule {}