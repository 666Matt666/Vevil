import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseMigrationService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private runMigrations;
    private addColumnIfNotExists;
}
