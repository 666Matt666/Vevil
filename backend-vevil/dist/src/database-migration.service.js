"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseMigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMigrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DatabaseMigrationService = DatabaseMigrationService_1 = class DatabaseMigrationService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseMigrationService_1.name);
    }
    async onModuleInit() {
        await this.runMigrations();
    }
    async runMigrations() {
        this.logger.log('Checking database migrations...');
        try {
            await this.addColumnIfNotExists('invoice', 'notes', 'TEXT');
            await this.addColumnIfNotExists('invoice', 'discountPercent', 'DECIMAL(5,2) DEFAULT 0');
            await this.addColumnIfNotExists('invoice', 'dueDate', 'DATE');
            await this.addColumnIfNotExists('invoice_item', 'discountPercent', 'DECIMAL(5,2) DEFAULT 0');
            this.logger.log('Database migrations completed successfully');
        }
        catch (error) {
            this.logger.error('Error running database migrations', error);
        }
    }
    async addColumnIfNotExists(table, column, definition) {
        const query = `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = '${table}' AND column_name = '${column}'
                ) THEN
                    ALTER TABLE ${table} ADD COLUMN ${column} ${definition};
                END IF;
            END $$;
        `;
        try {
            await this.dataSource.query(query);
            this.logger.log(`Column ${column} on ${table} is ready`);
        }
        catch (error) {
            this.logger.warn(`Could not add column ${column} to ${table}: ${error.message}`);
        }
    }
};
exports.DatabaseMigrationService = DatabaseMigrationService;
exports.DatabaseMigrationService = DatabaseMigrationService = DatabaseMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DatabaseMigrationService);
//# sourceMappingURL=database-migration.service.js.map