import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './entities/user-role.enum';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(paginationQuery: PaginationQueryDto): Promise<[User[], number]>;
    findOne(id: string): Promise<User>;
    findOneByEmail(email: string): Promise<User | undefined>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    create(createUserDto: CreateUserDto, role?: UserRole): Promise<User>;
    setAvatar(userId: string, avatarFilename: string): Promise<User>;
    count(): Promise<number>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        lastName?: string;
        gender?: "male" | "female";
        avatar?: string;
        role: UserRole;
        isActive: boolean;
        resetPasswordToken?: string;
        resetPasswordExpires?: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setResetPasswordToken(email: string, token: string, expires: Date): Promise<boolean>;
    findOneByResetToken(token: string): Promise<User | null>;
    clearResetPasswordToken(userId: string): Promise<void>;
    toggleActive(id: string, requestingUserId?: string): Promise<User>;
}
