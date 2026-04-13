import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { Invoice } from '../invoices/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice])],
    controllers: [PublicController],
})
export class PublicModule {}