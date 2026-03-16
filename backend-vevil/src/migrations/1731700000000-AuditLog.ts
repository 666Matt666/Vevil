import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLog1731700000000 implements MigrationInterface {
  name = 'AuditLog1731700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_log_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_log_entityType_entityId"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_log_userId"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
