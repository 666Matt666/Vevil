import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        hashedRefreshToken?: string;
        avatarPath?: string;
        role: import("@/users/user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(user: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
