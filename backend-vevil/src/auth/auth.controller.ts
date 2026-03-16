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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@/users/user.entity';
import { JwtRefreshGuard } from '@/auth/guards/jwt-refresh.guard';
import { Public } from '@/auth/decorators/public.decorator';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestRegistrationDto } from './dto/request-registration.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PendingRegistrationsService } from '@/pending-registrations/pending-registrations.service';
import { UsersService } from '@/users/users.service';
import { AuditService } from '@/audit/audit.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private pendingRegistrationsService: PendingRegistrationsService,
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  @Public() // Endpoint público
  @Throttle({ short: { limit: 5, ttl: 60_000 } }) // 5 intentos por minuto por IP
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve tokens.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@GetUser() user: User, @Body() _loginDto: LoginDto, @Request() req: any) {
    const result = await this.authService.login(user);
    await this.auditService.log({
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      action: 'auth.login',
      entityType: 'auth',
      entityId: user?.id ?? '',
      ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
    }).catch(() => {});
    return result;
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
  async logout(@GetUser() user: User & { userId?: string }) {
    const userId = user.id ?? (user as any).userId;
    return this.authService.logout(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar tokens de autenticación' })
  async refreshTokens(@GetUser() user: User & { refreshToken: string }) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
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
}