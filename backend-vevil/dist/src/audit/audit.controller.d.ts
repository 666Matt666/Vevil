import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(userId?: string, entityType?: string, entityId?: string, limitStr?: string): Promise<import("./audit-log.entity").AuditLog[]>;
}
