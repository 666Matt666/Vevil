import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@/users/user.entity'; // 1. Importar UserRole
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Valida si las credenciales de un usuario son correctas.
   * @param email El email del usuario.
   * @param pass La contraseña en texto plano.
   * @returns El objeto de usuario si es válido, de lo contrario null.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email); // Asegúrate que este método devuelve el usuario con su contraseña
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Genera un par de tokens (acceso y refresco) para un usuario.
   * @param user El objeto de usuario validado (sin la contraseña).
   * @returns Un objeto con el access_token y el refresh_token.
   */
  async login(user: Omit<User, 'password' | 'hashedRefreshToken'>) {
    const payload = { username: user.email, sub: user.id, role: user.role };

    // Generamos el access token y el refresh token en paralelo
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Almacenamos el hash del refresh token en la base de datos
    await this.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) throw new UnauthorizedException('Acceso denegado');

    // El usuario está validado, creamos un nuevo par de tokens.
    // Es importante no pasar el objeto 'user' completo a login() para no re-firmar el hashedRefreshToken.
    // 2. Aseguramos que el payload tenga las propiedades esperadas por Omit<User, ...>
    //    Asumimos que name, createdAt y updatedAt son opcionales o se pueden omitir aquí.
    const userPayloadForLogin: Omit<User, 'password' | 'hashedRefreshToken'> = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name, // Añadido
      createdAt: user.createdAt, // Añadido
      updatedAt: user.updatedAt, // Añadido
    }
    return this.login(userPayloadForLogin);
  }

  /**
   * Invalida el refresh token de un usuario.
   * @param userId El ID del usuario que cierra sesión.
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.update(userId, { hashedRefreshToken: null });
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param email El email del nuevo usuario.
   * @param password La contraseña en texto plano.
   * @returns El usuario creado (sin datos sensibles).
   */
  async register(registerDto: RegisterDto) {
    const { email, name } = registerDto; // Ya no necesitamos la contraseña aquí
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    const userCount = await this.usersService.count();
    const isFirstUser = userCount === 0;

    // Pasamos el DTO completo al servicio de usuarios, que se encargará de la encriptación.
    const newUser = await this.usersService.create({
      ...registerDto,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    });

    // Devolvemos el usuario sin la contraseña y sin generar tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result;
  }
}
