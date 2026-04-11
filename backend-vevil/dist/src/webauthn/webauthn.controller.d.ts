import { User } from '@/users/user.entity';
import { WebAuthnService } from './webauthn.service';
export declare class WebAuthnController {
    private readonly webauthnService;
    constructor(webauthnService: WebAuthnService);
    getRegisterOptions(user: User): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyRegister(user: User, body: {
        response: any;
        challenge: string;
    }): Promise<{
        verified: boolean;
    }>;
    getLoginOptions(body: {
        email: string;
    }): Promise<import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON & {
        challenge: string;
    }>;
    verifyLogin(body: {
        response: any;
        challenge: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
