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
    login(user: User, _loginDto: LoginDto, req: any, res: Response): unknown;
    requestRegistration(dto: RequestRegistrationDto): unknown;
    confirmRegistration(token: string | undefined): unknown;
    register(createUserDto: CreateUserDto): unknown;
    getProfile(user: User & {
        userId?: string;
    }): unknown;
    logout(user: User & {
        userId?: string;
    }, res: Response): unknown;
    refreshTokens(user: User & {
        refreshToken: string;
    }, res: Response): unknown;
    forgotPassword(dto: ForgotPasswordDto): unknown;
    resetPassword(dto: ResetPasswordDto): unknown;
    changePassword(user: User, dto: ChangePasswordDto): unknown;
    enableUser(body: {
        email: string;
    }): unknown;
}
