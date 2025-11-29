import { AuthService } from './auth.service';
import { User } from '@/users/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(user: User, _loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        avatar?: string;
        role: import("../users/entities/user-role.enum").UserRole;
        hashedRefreshToken?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(user: User): User;
    logout(user: User): Promise<void>;
    refreshTokens(user: User & {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
