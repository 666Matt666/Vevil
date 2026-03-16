import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { WebAuthnCredential } from './webauthn-credential.entity';
import { UsersService } from '@/users/users.service';
import { AuthService } from '@/auth/auth.service';

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface StoredChallenge {
  type: 'registration' | 'auth';
  userId?: string;
  email?: string;
  createdAt: number;
}

@Injectable()
export class WebAuthnService {
  private readonly challengeStore = new Map<string, StoredChallenge>();

  constructor(
    @InjectRepository(WebAuthnCredential)
    private readonly credentialRepo: Repository<WebAuthnCredential>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setChallenge(challenge: string, data: Omit<StoredChallenge, 'createdAt'>): void {
    this.challengeStore.set(challenge, { ...data, createdAt: Date.now() });
  }

  /** Obtiene el challenge solo si existe, coincide el tipo y no expiró. Lo elimina (un solo uso). */
  private getAndConsumeChallenge(
    challenge: string,
    expectedType: 'registration' | 'auth',
    expectedUserId?: string,
  ): StoredChallenge | null {
    const entry = this.challengeStore.get(challenge);
    if (!entry || entry.type !== expectedType) return null;
    if (Date.now() - entry.createdAt > CHALLENGE_TTL_MS) {
      this.challengeStore.delete(challenge);
      return null;
    }
    if (expectedType === 'registration' && expectedUserId && entry.userId !== expectedUserId) return null;
    this.challengeStore.delete(challenge);
    return entry;
  }

  private getRpId(): string {
    const rpId = this.configService.get<string>('WEBAUTHN_RP_ID');
    if (rpId) return rpId;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    try {
      const u = new URL(frontendUrl);
      return u.hostname;
    } catch {
      return 'localhost';
    }
  }

  private getOrigin(): string {
    const origin = this.configService.get<string>('WEBAUTHN_ORIGIN');
    if (origin) return origin;
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  }

  async getRegistrationOptions(userId: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    const existing = await this.credentialRepo.find({ where: { userId } });
    const options = await generateRegistrationOptions({
      rpName: this.configService.get<string>('WEBAUTHN_RP_NAME') || 'Vevil',
      rpID: this.getRpId(),
      userName: user.email,
      userID: Buffer.from(user.id, 'utf8').slice(0, 64),
      userDisplayName: user.name || user.email,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: existing.map((c) => ({
        id: c.credentialId as unknown as string,
      })),
    });
    this.setChallenge(options.challenge, { type: 'registration', userId });
    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    expectedChallenge: string,
  ): Promise<{ verified: boolean }> {
    const stored = this.getAndConsumeChallenge(expectedChallenge, 'registration', userId);
    if (!stored) {
      throw new BadRequestException(
        'Challenge inválido, expirado o ya utilizado. Solicitá de nuevo las opciones para registrar huella.',
      );
    }
    const origin = this.getOrigin();
    const rpID = this.getRpId();
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return { verified: false };
    }
    const { credential, credentialDeviceType } = verification.registrationInfo;
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');
    await this.credentialRepo.save(
      this.credentialRepo.create({
        userId,
        credentialId: credential.id,
        publicKey: publicKeyBase64,
        counter: credential.counter ?? 0,
        deviceType: credentialDeviceType,
      }),
    );
    return { verified: true };
  }

  async getAuthenticationOptions(email: string): Promise<PublicKeyCredentialRequestOptionsJSON & { challenge: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    const credentials = await this.credentialRepo.find({ where: { userId: user.id } });
    const options = await generateAuthenticationOptions({
      rpID: this.getRpId(),
      allowCredentials: credentials.map((c) => ({ id: c.credentialId as unknown as string })),
      userVerification: 'preferred',
    });
    this.setChallenge(options.challenge, { type: 'auth', email: user.email });
    return options as PublicKeyCredentialRequestOptionsJSON & { challenge: string };
  }

  async verifyAuthentication(
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    const stored = this.getAndConsumeChallenge(expectedChallenge, 'auth');
    if (!stored) {
      throw new BadRequestException(
        'Challenge inválido, expirado o ya utilizado. Volvé a solicitar iniciar sesión con huella.',
      );
    }
    const credentialId = response.id;
    const credential = await this.credentialRepo.findOne({
      where: { credentialId },
      relations: ['user'],
    });
    if (!credential?.user) return null;
    const origin = this.getOrigin();
    const rpID = this.getRpId();
    const publicKeyBuffer = Buffer.from(credential.publicKey, 'base64');
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: publicKeyBuffer,
        counter: credential.counter,
      },
    });
    if (!verification.verified) return null;
    await this.credentialRepo.update(
      { id: credential.id },
      { counter: verification.authenticationInfo.newCounter },
    );
    const user = credential.user;
    const { password, hashedRefreshToken, ...safeUser } = user as any;
    return this.authService.login(safeUser);
  }
}
