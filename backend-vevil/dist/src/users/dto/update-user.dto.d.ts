import { UserRole } from '@/users/entities/user-role.enum';
declare const UpdateUserDto_base: any;
export declare class UpdateUserDto extends UpdateUserDto_base {
    avatar?: string;
    hashedRefreshToken?: string | null;
    avatarPath?: string;
    role?: UserRole;
    password?: string;
    isActive?: boolean;
}
export {};
