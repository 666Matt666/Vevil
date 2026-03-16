import { AuthService } from './auth.service';
import { User } from '@/users/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestRegistrationDto } from './dto/request-registration.dto';
import { PendingRegistrationsService } from '@/pending-registrations/pending-registrations.service';
import { UsersService } from '@/users/users.service';
import { AuditService } from '@/audit/audit.service';
export declare class AuthController {
    private authService;
    private pendingRegistrationsService;
    private usersService;
    private auditService;
    constructor(authService: AuthService, pendingRegistrationsService: PendingRegistrationsService, usersService: UsersService, auditService: AuditService);
    login(user: User, _loginDto: LoginDto, req: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    requestRegistration(dto: RequestRegistrationDto): Promise<{
        message: string;
    }>;
    confirmRegistration(token: string | undefined): Promise<{
        message: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        lastName?: string;
        gender?: "male" | "female";
        avatar?: string;
        role: import("../users/entities/user-role.enum").UserRole;
        hashedRefreshToken?: string;
        resetPasswordToken?: string;
        resetPasswordExpires?: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(user: User & {
        userId?: string;
    }): Promise<{
        role: string;
        id: string;
        email: string;
        name: string;
        lastName?: string;
        gender?: "male" | "female";
        avatar?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(user: User & {
        userId?: string;
    }): Promise<void>;
    refreshTokens(user: User & {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
