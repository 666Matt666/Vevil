import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseMigrationService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        await this.runMigrations();
    }

    private async runMigrations() {
        this.logger.log('Checking database migrations...');
        
        try {
            // Migración: agregar campos a invoice
            await this.addColumnIfNotExists('invoice', 'notes', 'TEXT');
            await this.addColumnIfNotExists('invoice', 'discountPercent', 'DECIMAL(5,2) DEFAULT 0');
            await this.addColumnIfNotExists('invoice', 'dueDate', 'DATE');
            
            // Migración: agregar campo a invoice_item
            await this.addColumnIfNotExists('invoice_item', 'discountPercent', 'DECIMAL(5,2) DEFAULT 0');
            
            this.logger.log('Database migrations completed successfully');
        } catch (error) {
            this.logger.error('Error running database migrations', error);
        }
    }

    private async addColumnIfNotExists(table: string, column: string, definition: string) {
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
        } catch (error) {
            this.logger.warn(`Could not add column ${column} to ${table}: ${error.message}`);
        }
    }
}