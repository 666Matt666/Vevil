"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog1731700000000 = void 0;
class AuditLog1731700000000 {
    constructor() {
        this.name = 'AuditLog1731700000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" SERIAL NOT NULL,
        "userId" uuid,
        "userEmail" character varying(255),
        "action" character varying(64) NOT NULL,
        "entityType" character varying(32) NOT NULL,
        "entityId" character varying(64),
        "oldValue" jsonb,
        "newValue" jsonb,
        "ip" character varying(45),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_userId" ON "audit_log" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_entityType_entityId" ON "audit_log" ("entityType", "entityId")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_createdAt" ON "audit_log" ("createdAt")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_audit_log_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_log_entityType_entityId"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_log_userId"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }
}
exports.AuditLog1731700000000 = AuditLog1731700000000;
//# sourceMappingURL=1731700000000-AuditLog.js.map