"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableRLS1731600000001 = void 0;
class EnableRLS1731600000001 {
    constructor() {
        this.name = 'EnableRLS1731600000001';
    }
    async up(queryRunner) {
        const tables = ['user', 'customer', 'product', 'invoice', 'invoice_item', 'payment'];
        for (const table of tables) {
            await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
        }
    }
    async down(queryRunner) {
        const tables = ['user', 'customer', 'product', 'invoice', 'invoice_item', 'payment'];
        for (const table of tables) {
            await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
        }
    }
}
exports.EnableRLS1731600000001 = EnableRLS1731600000001;
//# sourceMappingURL=1731600000001-EnableRLS.js.map