import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@/users/user.entity';
import { JwtRefreshGuard } from '@/auth/guards/jwt-refresh.guard';
import { Public } from '@/auth/decorators/public.decorator';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestRegistrationDto } from './dto/request-registration.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PendingRegistrationsService } from '@/pending-registrations/pending-registrations.service';
import { UsersService } from '@/users/users.service';
import { AuditService } from '@/audit/audit.service';

// Constantes para nombres de cookies
export const ACCESS_TOKEN_COOKIE = 'vevil_access_token';
export const REFRESH_TOKEN_COOKIE = 'vevil_refresh_token';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private pendingRegistrationsService: PendingRegistrationsService,
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  /**
   * Configura las cookies HttpOnly con los tokens de autenticación.
   */
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // En desarrollo local, NO usar sameSite para permitir cookies en todos los contextos
    // En producción, usar 'strict' para mayor seguridad
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      maxAge: 15 * 60 * 1000, // 15 minutos (igual que access_token)
      path: '/',
    };
    
    if (isProduction) {
      cookieOptions.sameSite = 'strict';
    }
    // En desarrollo, no usamos sameSite para que funcione correctamente
    
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);

    // Para el refresh token
    const refreshCookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    };
    
    if (isProduction) {
      refreshCookieOptions.sameSite = 'strict';
    }
    
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
  }

  /**
   * Limpia las cookies de autenticación.
   */
  private clearTokenCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  @Public() // Endpoint público
  @Throttle({ short: { limit: 5, ttl: 60_000 } }) // 5 intentos por minuto por IP
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(
    @GetUser() user: User,
    @Body() _loginDto: LoginDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    console.log('[AUTH] Login request for user:', user?.email);
    const result = await this.authService.login(user);
    
    // Enviar tokens en el body (sistema original que funciona)
    // Limpiar cookies si existen de intentos anteriores
    this.clearTokenCookies(res);
    
    return res.json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: result.user,
    });
    
    await this.auditService.log({
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      action: 'auth.login',
      entityType: 'auth',
      entityId: user?.id ?? '',
      ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
    }).catch(() => {});

    // Enviar solo datos del usuario (sin tokens en el body para seguridad)
    return res.json({
      user: result.user,
    });
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @Post('request-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar registro (envía email para confirmar correo)' })
  @ApiResponse({ status: 200, description: 'Se envió un correo para confirmar.' })
  @ApiResponse({ status: 409, description: 'El email ya existe.' })
  async requestRegistration(@Body() dto: RequestRegistrationDto) {
    return this.pendingRegistrationsService.createRequest(dto);
  }

  @Public()
  @Throttle({ short: { limit: 10, ttl: 60_000 } })
  @Get('confirm-registration')
  @ApiOperation({ summary: 'Confirmar correo desde el link del email' })
  @ApiResponse({ status: 200, description: 'Correo confirmado, pendiente de aprobación de un admin.' })
  async confirmRegistration(@Query('token') token: string | undefined) {
    if (!token) throw new BadRequestException('Falta el token.');
    return this.pendingRegistrationsService.confirmEmail(token);
  }

  @Public() // Mantener por compatibilidad; se recomienda usar request-registration + flujo de aprobación
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario (registro directo, sin aprobación)' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El email ya existe.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.', type: User })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(@GetUser() user: User & { userId?: string }) {
    const id = user.id ?? (user as any).userId;
    const full = await this.usersService.findOne(id);
    const { password, hashedRefreshToken, resetPasswordToken, resetPasswordExpires, ...profile } = full;
    return { ...profile, role: full.role != null ? String(full.role) : undefined };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión del usuario' })
  async logout(
    @GetUser() user: User & { userId?: string },
    @Res() res: Response,
  ) {
    const userId = user.id ?? (user as any).userId;
    console.log('[AUTH] Logout for user:', userId);
    await this.authService.logout(userId);
    this.clearTokenCookies(res);
    console.log('[AUTH] Logout complete for user:', userId);
    return res.json({ message: 'Sesión cerrada correctamente' });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar tokens de autenticación' })
  async refreshTokens(
    @GetUser() user: User & { refreshToken: string },
    @Res() res: Response,
  ) {
    console.log('[AUTH] Refresh tokens for user:', user.id, 'refreshToken present:', !!user.refreshToken);
    const result = await this.authService.refreshTokens(user.id, user.refreshToken);
    // Enviar tokens en el body
    console.log('[AUTH] Tokens refreshed successfully for user:', user.id);
    return res.json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: result.user,
    });
  }

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60_000 } }) // 3 solicitudes por minuto por IP
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario logueado' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 401, description: 'La contraseña actual es incorrecta' })
  async changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}