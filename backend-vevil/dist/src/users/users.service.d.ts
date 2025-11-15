import { Repository } from 'typeorm';
import { User } from './user.entity';
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
    create(createUserDto: CreateUserDto): Promise<User>;
    setAvatar(userId: string, avatarFilename: string): Promise<User>;
    count(): Promise<number>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatarPath?: string;
        role: import("./user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
