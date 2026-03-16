import { User } from '@/users/user.entity';
export declare class WebAuthnCredential {
    id: string;
    userId: string;
    user: User;
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceType?: string;
    createdAt: Date;
}
