import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/decorators/public.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/users/user.entity';
import { WebAuthnService } from './webauthn.service';

@Controller('auth/webauthn')
@ApiTags('WebAuthn')
export class WebAuthnController {
  constructor(private readonly webauthnService: WebAuthnService) {}

  @Post('register/options')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener opciones para registrar huella/passkey (requiere sesión)' })
  @ApiResponse({ status: 200, description: 'Opciones para navigator.credentials.create()' })
  getRegisterOptions(@GetUser() user: User) {
    return this.webauthnService.getRegistrationOptions(user.id);
  }

  @Post('register/verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Verificar y guardar la credencial de huella registrada' })
  @ApiResponse({ status: 200, description: 'Credencial guardada' })
  async verifyRegister(
    @GetUser() user: User,
    @Body() body: { response: any; challenge: string },
  ) {
    return this.webauthnService.verifyRegistration(user.id, body.response, body.challenge);
  }

  @Public()
  @Post('login/options')
  @ApiOperation({ summary: 'Obtener opciones para login con huella (pasar email)' })
  @ApiResponse({ status: 200, description: 'Opciones para navigator.credentials.get()' })
  getLoginOptions(@Body() body: { email: string }) {
    if (!body?.email?.trim()) throw new BadRequestException('email es requerido');
    return this.webauthnService.getAuthenticationOptions(body.email.trim().toLowerCase());
  }

  @Public()
  @Post('login/verify')
  @ApiOperation({ summary: 'Verificar huella y devolver tokens' })
  @ApiResponse({ status: 200, description: 'Tokens JWT' })
  async verifyLogin(@Body() body: { response: any; challenge: string }) {
    if (!body?.response || !body?.challenge) throw new BadRequestException('response y challenge son requeridos');
    const tokens = await this.webauthnService.verifyAuthentication(
      body.response,
      body.challenge,
    );
    if (!tokens) throw new BadRequestException('Verificación fallida');
    return tokens;
  }
}
