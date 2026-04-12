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
            // Invoice table: add notes, dueDate (not discountPercent - handled differently)
            await this.dataSource.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE LOWER(table_name) = 'invoice' 
                        AND LOWER(column_name) = 'notes'
                    ) THEN
                        ALTER TABLE invoice ADD COLUMN notes TEXT;
                    END IF;
                    
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE LOWER(table_name) = 'invoice' 
                        AND LOWER(column_name) = 'duedate'
                    ) THEN
                        ALTER TABLE invoice ADD COLUMN dueDate DATE;
                    END IF;
                    
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE LOWER(table_name) = 'invoice' 
                        AND LOWER(column_name) = 'discountpercent'
                    ) THEN
                        ALTER TABLE invoice ADD COLUMN "discountPercent" DECIMAL(5,2) DEFAULT 0;
                    END IF;
                END $$;
            `);
            this.logger.log('Invoice columns ready');

            // Invoice_item table: add discountPercent
            await this.dataSource.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE LOWER(table_name) = 'invoice_item' 
                        AND LOWER(column_name) = 'discountpercent'
                    ) THEN
                        ALTER TABLE invoice_item ADD COLUMN "discountPercent" DECIMAL(5,2) DEFAULT 0;
                    END IF;
                END $$;
            `);
            this.logger.log('Invoice_item columns ready');
            
            this.logger.log('Database migrations completed successfully');
        } catch (error) {
            this.logger.error('Error running database migrations:', error.message);
        }
    }
}