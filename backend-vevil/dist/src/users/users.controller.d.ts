import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersResponseDto } from '@/users/dto/paginated-users-response.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedUsersResponseDto>;
    uploadAvatar(user: User, file: Express.Multer.File): Promise<User>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, user: User): Promise<User>;
    remove(id: string): Promise<void>;
}
