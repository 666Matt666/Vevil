export declare enum UserRole {
    ADMIN = "admin",
    SUPERVISOR = "supervisor",
    USER = "user"
}
export declare class User {
    id: string;
    email: string;
    name: string;
    password: string;
    hashedRefreshToken?: string;
    avatarPath?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
