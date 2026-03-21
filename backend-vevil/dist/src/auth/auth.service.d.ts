import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/users/user.entity';
import { UserRole } from '@/users/entities/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { MailService } from '@/mail/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: Omit<User, 'password' | 'hashedRefreshToken'>): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    logout(userId: string): Promise<void>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        lastName?: string;
        gender?: "male" | "female";
        avatar?: string;
        role: UserRole;
        hashedRefreshToken?: string;
        resetPasswordToken?: string;
        resetPasswordExpires?: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
