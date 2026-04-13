import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupplierTable1700000000000 implements MigrationInterface {
    name = 'CreateSupplierTable1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "supplier" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "name" varchar NOT NULL,
                "email" varchar NOT NULL UNIQUE,
                "phones" jsonb DEFAULT [],
                "contact_person" varchar,
                "address_street" varchar,
                "address_city" varchar,
                "address_province" varchar,
                "tax_id" varchar,
                "notes" varchar,
                "is_active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_supplier_email" ON "supplier" ("email")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_supplier_name" ON "supplier" ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_supplier_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_supplier_email"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "supplier"`);
    }
}