import { UserRole } from './entities/user-role.enum';
export declare class User {
    id: string;
    email: string;
    name: string;
    lastName?: string;
    gender?: 'male' | 'female';
    password?: string;
    avatar?: string;
    role: UserRole;
    hashedRefreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
