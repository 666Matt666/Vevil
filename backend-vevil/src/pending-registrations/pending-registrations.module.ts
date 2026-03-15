import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingRegistration } from './pending-registration.entity';
import { PendingRegistrationsService } from './pending-registrations.service';
import { PendingRegistrationsController } from './pending-registrations.controller';
import { UsersModule } from '@/users/users.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingRegistration]),
    UsersModule,
    MailModule,
  ],
  controllers: [PendingRegistrationsController],
  providers: [PendingRegistrationsService],
  exports: [PendingRegistrationsService],
})
export class PendingRegistrationsModule {}
