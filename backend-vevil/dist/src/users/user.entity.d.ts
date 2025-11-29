import { UserRole } from './entities/user-role.enum';
export declare class User {
    id: string;
    email: string;
    name: string;
    password?: string;
    avatar?: string;
    role: UserRole;
    hashedRefreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
