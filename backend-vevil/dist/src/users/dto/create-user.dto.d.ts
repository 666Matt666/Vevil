import { UserRole } from '@/users/entities/user-role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
