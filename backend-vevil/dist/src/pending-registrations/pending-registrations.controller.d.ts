import { User } from '@/users/user.entity';
import { PendingRegistrationsService } from './pending-registrations.service';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { PendingRegistration } from './pending-registration.entity';
export declare class PendingRegistrationsController {
    private readonly service;
    constructor(service: PendingRegistrationsService);
    findAllPending(): Promise<PendingRegistration[]>;
    countPending(): Promise<{
        count: number;
    }>;
    approve(id: string, dto: ApproveRegistrationDto, _user: User): Promise<{
        message: string;
    }>;
    reject(id: string, _user: User): Promise<{
        message: string;
    }>;
}
