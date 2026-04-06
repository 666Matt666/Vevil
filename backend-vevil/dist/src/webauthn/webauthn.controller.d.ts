import { User } from '@/users/user.entity';
import { WebAuthnService } from './webauthn.service';
export declare class WebAuthnController {
    private readonly webauthnService;
    constructor(webauthnService: WebAuthnService);
    getRegisterOptions(user: User): Promise<PublicKeyCredentialCreationOptionsJSON>;
    verifyRegister(user: User, body: {
        response: any;
        challenge: string;
    }): unknown;
    getLoginOptions(body: {
        email: string;
    }): Promise<any>;
    verifyLogin(body: {
        response: any;
        challenge: string;
    }): unknown;
}
