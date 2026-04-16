import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBackupIndexes1684589130000 implements MigrationInterface {
    name = 'AddBackupIndexes1684589130000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Partial index: completed backups by frequency + createdAt (covers admin list queries)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_frequency_created_completed 
            ON "backups" (frequency, "createdAt") 
            WHERE status = 'completed'
        `);

        // Partial index: completed backups by slot + status (covers find latest by slot)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_slot_status_completed 
            ON "backups" (slot, status) 
            WHERE status = 'completed'
        `);

        // General index on createdAt for ordering (backup listing)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_created_at 
            ON "backups" ("createdAt")
        `);

        // Composite index for admin queries (frequency + status + createdAt ordering)
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_frequency_status_created 
            ON "backups" (frequency, status, "createdAt DESC")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX IF EXISTS idx_backup_frequency_status_created`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_backup_created_at`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_backup_slot_status_completed`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_backup_frequency_created_completed`);
    }
}
