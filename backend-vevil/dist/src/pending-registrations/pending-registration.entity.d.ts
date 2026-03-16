export type PendingRegistrationStatus = 'pending_email' | 'pending_approval' | 'approved' | 'rejected';
export declare class PendingRegistration {
    id: string;
    email: string;
    name: string;
    lastName?: string;
    gender?: 'male' | 'female';
    emailConfirmationToken?: string;
    emailConfirmationExpires?: Date;
    emailConfirmedAt?: Date;
    status: PendingRegistrationStatus;
    createdAt: Date;
    updatedAt: Date;
}
