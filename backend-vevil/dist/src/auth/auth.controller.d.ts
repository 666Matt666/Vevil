import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '@/users/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestRegistrationDto } from './dto/request-registration.dto';
import { PendingRegistrationsService } from '@/pending-registrations/pending-registrations.service';
import { UsersService } from '@/users/users.service';
import { AuditService } from '@/audit/audit.service';
export declare const ACCESS_TOKEN_COOKIE = "vevil_access_token";
export declare const REFRESH_TOKEN_COOKIE = "vevil_refresh_token";
export declare const COOKIE_MAX_AGE: number;
export declare class AuthController {
    private authService;
    private pendingRegistrationsService;
    private usersService;
    private auditService;
    constructor(authService: AuthService, pendingRegistrationsService: PendingRegistrationsService, usersService: UsersService, auditService: AuditService);
    private setTokenCookies;
    private clearTokenCookies;
    login(user: User, _loginDto: LoginDto, req: any, res: Response): Promise<Response<any, Record<string, any>>>;
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
        isActive: boolean;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(user: User & {
        userId?: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshTokens(user: User & {
        refreshToken: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    enableUser(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
}
