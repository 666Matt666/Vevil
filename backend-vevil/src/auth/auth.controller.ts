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
  UnauthorizedException,
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
  ) { }

  /**
   * Configura las cookies HttpOnly con los tokens de autenticación.
   */
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('[Auth] setTokenCookies: isProduction:', isProduction);

    // Configuración de cookies para cross-site (Vercel -> Render)
    // Usar 'lax' que funciona mejor en la mayoría de los casos
    const sameSiteValue = 'lax';

    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      maxAge: 15 * 60 * 1000, // 15 minutos (igual que access_token)
      path: '/',
      sameSite: sameSiteValue,
    };

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
    console.log('[Auth] Access cookie set, options:', JSON.stringify(cookieOptions));

    // Para el refresh token - configuración similar
    const refreshCookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: sameSiteValue,
    };

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
    console.log('[Auth] Refresh cookie set, options:', JSON.stringify(refreshCookieOptions));
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
    console.log('[Auth] Login attempt for:', user?.email);
    const result = await this.authService.login(user);
    console.log('[Auth] Login result, user:', result.user?.email);

    // Limpiar cookies si existen de intentos anteriores
    this.clearTokenCookies(res);

    // Configurar cookies con los tokens
    this.setTokenCookies(res, result.access_token, result.refresh_token);
    console.log('[Auth] Cookies set, sending response...');

    // Log de auditoría
    await this.auditService.log({
      userId: result.user?.id,
      userEmail: result.user?.email,
      action: 'auth.login_success',
      entityType: 'auth',
      entityId: result.user?.id?.toString(),
      newValue: { email: result.user?.email },
      ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
    }).catch(() => { });

    // Enviar tokens en el body (sistema original que funciona)
    return res.json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
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
    // If no user, return unauthorized
    if (!user) {
      throw new UnauthorizedException('No hay sesión activa');
    }
    const id = user.id ?? (user as any).userId;
    console.log('[Auth] getProfile called, userId:', id);
    const full = await this.usersService.findOne(id);

    // Log de auditoría
    await this.auditService.log({
      userId: id,
      userEmail: full?.email,
      action: 'auth.profile_accessed',
      entityType: 'auth',
      entityId: id?.toString(),
      newValue: { email: full?.email },
    }).catch(() => { });

    const { password, hashedRefreshToken, resetPasswordToken, resetPasswordExpires, ...profile } = full;
    console.log('[Auth] getProfile returning:', profile.email);
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
    console.log('[Auth] Logout called, userId:', userId);

    // Log de auditoría
    await this.auditService.log({
      userId,
      userEmail: user.email,
      action: 'auth.logout',
      entityType: 'auth',
      entityId: userId?.toString(),
    }).catch(() => { });

    await this.authService.logout(userId);
    this.clearTokenCookies(res);
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
    const result = await this.authService.refreshTokens(user.id, user.refreshToken);
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

  @Public()
  @Post('enable-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Habilitar usuario por email (temporal)' })
  @ApiResponse({ status: 200, description: 'Usuario habilitado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async enableUser(@Body() body: { email: string }) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (user.isActive) {
      return { message: 'El usuario ya está habilitado' };
    }
    await this.usersService.update(user.id, { isActive: true });
    return { message: 'Usuario habilitado exitosamente' };
  }
}