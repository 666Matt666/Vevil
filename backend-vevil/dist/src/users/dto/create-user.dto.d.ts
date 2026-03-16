import { UserRole } from '@/users/entities/user-role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    lastName?: string;
    gender?: 'male' | 'female';
    role?: UserRole;
}
