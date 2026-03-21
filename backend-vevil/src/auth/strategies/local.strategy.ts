import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({ usernameField: 'email' }); // Le decimos a Passport que use 'email' como el campo de usuario
  }

  async validate(email: string, password: string): Promise<any> {
    // Primero verificamos si el usuario existe
    const userExists = await this.usersService.findOneByEmail(email);
    
    if (!userExists) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }
    
    // Si existe, verificamos la contraseña
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('INVALID_PASSWORD');
    }
    return user;
  }
}