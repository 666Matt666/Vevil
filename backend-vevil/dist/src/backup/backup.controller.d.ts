import { BackupService } from './backup.service';
import { Response } from 'express';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    listBackups(frequency?: string, limit?: string): Promise<{
        data: import("./backup.entity").Backup[];
        total: number;
    }>;
    getBackup(id: string): Promise<import("./backup.entity").Backup>;
    getBackupContent(id: string): Promise<{
        error: string;
        backup?: undefined;
        preview?: undefined;
        totalLines?: undefined;
    } | {
        backup: import("./backup.entity").Backup;
        preview: any;
        totalLines: any;
        error?: undefined;
    }>;
    downloadBackup(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    triggerBackup(): Promise<import("./backup.entity").Backup>;
    markAsDownloaded(id: string): Promise<import("./backup.entity").Backup>;
    deleteBackup(id: string): Promise<{
        success: boolean;
    }>;
}
