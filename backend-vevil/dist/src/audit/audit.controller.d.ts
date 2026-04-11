import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(userId?: string, entityType?: string, entityId?: string, limitStr?: string, offsetStr?: string): Promise<{
        data: import("./audit-log.entity").AuditLog[];
        total: number;
    }>;
}
