import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@/users/user.entity';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
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
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        hashedRefreshToken?: string;
        avatarPath?: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
