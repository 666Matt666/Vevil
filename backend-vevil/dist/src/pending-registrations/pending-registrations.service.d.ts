import { Repository } from 'typeorm';
import { PendingRegistration } from './pending-registration.entity';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/entities/user-role.enum';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
export declare class PendingRegistrationsService {
    private readonly repo;
    private readonly usersService;
    private readonly mailService;
    private readonly configService;
    constructor(repo: Repository<PendingRegistration>, usersService: UsersService, mailService: MailService, configService: ConfigService);
    createRequest(data: {
        email: string;
        name: string;
        lastName?: string;
        gender?: 'male' | 'female';
    }): Promise<{
        message: string;
    }>;
    private sendConfirmationEmail;
    confirmEmail(token: string): Promise<{
        message: string;
    }>;
    findAllPending(): Promise<PendingRegistration[]>;
    countPending(): Promise<number>;
    approve(id: string, role: UserRole): Promise<{
        message: string;
    }>;
    reject(id: string): Promise<{
        message: string;
    }>;
}
