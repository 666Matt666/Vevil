import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { WebAuthnCredential } from './webauthn-credential.entity';
import { UsersService } from '@/users/users.service';
import { AuthService } from '@/auth/auth.service';
export declare class WebAuthnService {
    private readonly credentialRepo;
    private readonly usersService;
    private readonly authService;
    private readonly configService;
    private readonly challengeStore;
    constructor(credentialRepo: Repository<WebAuthnCredential>, usersService: UsersService, authService: AuthService, configService: ConfigService);
    private setChallenge;
    private getAndConsumeChallenge;
    private getRpId;
    private getOrigin;
    getRegistrationOptions(userId: string): Promise<PublicKeyCredentialCreationOptionsJSON>;
    verifyRegistration(userId: string, response: RegistrationResponseJSON, expectedChallenge: string): Promise<{
        verified: boolean;
    }>;
    getAuthenticationOptions(email: string): Promise<PublicKeyCredentialRequestOptionsJSON & {
        challenge: string;
    }>;
    verifyAuthentication(response: AuthenticationResponseJSON, expectedChallenge: string): Promise<{
        access_token: string;
        refresh_token: string;
    } | null>;
}
