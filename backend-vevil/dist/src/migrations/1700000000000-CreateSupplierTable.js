"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSupplierTable1700000000000 = void 0;
class CreateSupplierTable1700000000000 {
    constructor() {
        this.name = 'CreateSupplierTable1700000000000';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_supplier_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_supplier_email"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "supplier"`);
    }
}
exports.CreateSupplierTable1700000000000 = CreateSupplierTable1700000000000;
//# sourceMappingURL=1700000000000-CreateSupplierTable.js.map