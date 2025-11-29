import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/users/user.entity';
import { UserRole } from '@/users/entities/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@/users/dto/create-user.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: Omit<User, 'password' | 'hashedRefreshToken'>): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string): Promise<void>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        avatar?: string;
        role: UserRole;
        hashedRefreshToken?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
