import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserRole } from '@/users/entities/user-role.enum';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    avatar?: string;
    hashedRefreshToken?: string | null;
    avatarPath?: string;
    role?: UserRole;
    password?: string;
}
export {};
