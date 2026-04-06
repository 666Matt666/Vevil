import { BackupService } from './backup.service';
import { Response } from 'express';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    listBackups(frequency?: string, limit?: string): unknown;
    getBackup(id: string): unknown;
    getBackupContent(id: string): unknown;
    downloadBackup(id: string, res: Response): unknown;
    triggerBackup(): unknown;
    markAsDownloaded(id: string): unknown;
    deleteBackup(id: string): unknown;
}
