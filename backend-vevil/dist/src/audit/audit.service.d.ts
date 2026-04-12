import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export interface AuditPayload {
    userId?: string | null;
    userEmail?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ip?: string | null;
}
export declare class AuditService {
    private readonly repo;
    constructor(repo: Repository<AuditLog>);
    private describeChanges;
    private humanizeKey;
    private formatObject;
    log(payload: AuditPayload): Promise<AuditLog>;
    findByUser(userId: string, limit?: number): Promise<AuditLog[]>;
    findByEntity(entityType: string, entityId: string, limit?: number): Promise<AuditLog[]>;
    findRecent(limit?: number, offset?: number): Promise<AuditLog[]>;
    getTotalCount(filters?: {
        userId?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<number>;
}
