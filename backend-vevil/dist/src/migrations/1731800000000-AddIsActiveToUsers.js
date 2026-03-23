"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsActiveToUsers1731800000000 = void 0;
class AddIsActiveToUsers1731800000000 {
    constructor() {
        this.name = 'AddIsActiveToUsers1731800000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_user_isActive" ON "user" ("isActive")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_user_isActive"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    }
}
exports.AddIsActiveToUsers1731800000000 = AddIsActiveToUsers1731800000000;
//# sourceMappingURL=1731800000000-AddIsActiveToUsers.js.map