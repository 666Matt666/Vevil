import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Endpoint público
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve tokens.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@GetUser() user: User, @Body() _loginDto: LoginDto) {
    // loginDto solo se usa para la validación y la documentación de Swagger.
    // El usuario validado viene de LocalStrategy a través de @GetUser().
    return this.authService.login(user);
  }

  @Public() // Endpoint público
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
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
  getProfile(@GetUser() user: User) {
    // El decorador @GetUser() extrae el usuario del payload del token JWT.
    // Por seguridad, no devolvemos la contraseña.
    delete user.password;
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión del usuario' })
  async logout(@GetUser() user: User) {
    const userId = user.id;
    return this.authService.logout(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar tokens de autenticación' })
  async refreshTokens(@GetUser() user: User & { refreshToken: string }) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }
}