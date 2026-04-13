/// <reference types="node" />
/// <reference types="node" />
import { Repository } from 'typeorm';
import { Backup, BackupType, BackupFrequency, BackupSlot } from './backup.entity';
export declare class BackupService {
    private readonly backupRepo;
    private readonly logger;
    private readonly backupDir;
    private readonly maxBackups;
    private readonly githubEnabled;
    private readonly githubToken;
    private readonly githubOwner;
    private readonly githubRepo;
    private readonly githubPath;
    private readonly deleteAfterUpload;
    private backupDestination;
    constructor(backupRepo: Repository<Backup>);
    private ensureBackupDir;
    getDbConfig(): {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
    getDailySlot(): BackupSlot;
    getWeeklySlot(): BackupSlot;
    getMonthlySlot(): BackupSlot;
    scheduledDailyBackup(): Promise<void>;
    scheduledWeeklyBackup(): Promise<void>;
    scheduledMonthlyBackup(): Promise<void>;
    createBackup(type: BackupType, frequency: BackupFrequency, slot: BackupSlot): Promise<Backup>;
    private createFullBackup;
    private createIncrementalBackup;
    private uploadToGithub;
    getBackups(limit?: number): Promise<Backup[]>;
    getBackupSettings(): {
        destination: "local" | "github";
        availableDestinations: string[];
        githubConfigured: boolean;
        githubRepo: string;
    };
    updateBackupSettings(destination: string): {
        success: boolean;
        destination: string;
    };
    getBackupById(id: string): Promise<Backup | null>;
    getBackupFile(id: string): Promise<Buffer | null>;
    triggerManualBackup(): Promise<Backup>;
    markAsDownloaded(id: string): Promise<Backup | null>;
    deleteBackup(id: string): Promise<boolean>;
}
