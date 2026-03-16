export declare class AuditLog {
    id: number;
    userId: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    ip: string | null;
    createdAt: Date;
}
