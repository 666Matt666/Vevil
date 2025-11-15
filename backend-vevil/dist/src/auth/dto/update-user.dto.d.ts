import { UserRole } from '@/users/user.entity';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<unknown>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    avatar?: string;
    hashedRefreshToken?: string | null;
    avatarPath?: string;
    role?: UserRole;
    password?: string;
}
export {};
