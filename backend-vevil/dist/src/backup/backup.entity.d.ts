export declare enum BackupType {
    FULL = "full",
    INCREMENTAL = "incremental"
}
export declare enum BackupFrequency {
    DIARIO = "diario",
    SEMANAL = "semanal",
    MENSUAL = "mensual"
}
export declare enum BackupStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum BackupSlot {
    DIARIO_1 = "diario_1",
    DIARIO_2 = "diario_2",
    DIARIO_3 = "diario_3",
    SEMANAL_1 = "semanal_1",
    SEMANAL_2 = "semanal_2",
    SEMANAL_3 = "semanal_3",
    SEMANAL_4 = "semanal_4",
    MENSUAL_1 = "mensual_1",
    MENSUAL_2 = "mensual_2",
    MENSUAL_3 = "mensual_3"
}
export declare class Backup {
    id: string;
    type: BackupType;
    frequency: BackupFrequency;
    slot: BackupSlot;
    status: BackupStatus;
    filePath: string;
    fileSize: number;
    errorMessage: string;
    needsDownload: boolean;
    createdAt: Date;
    completedAt: Date;
}
