import { UserRole } from '@/users/user.entity';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
