import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental'
}

export enum BackupFrequency {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  MENSUAL = 'mensual'
}

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum BackupSlot {
  // Diarios (3 rotativos)
  DIARIO_1 = 'diario_1',
  DIARIO_2 = 'diario_2',
  DIARIO_3 = 'diario_3',
  // Semanales (4 rotativos - semana 1-4 del mes)
  SEMANAL_1 = 'semanal_1',
  SEMANAL_2 = 'semanal_2',
  SEMANAL_3 = 'semanal_3',
  SEMANAL_4 = 'semanal_4',
  // Mensuales (3 rotativos - 3 meses)
  MENSUAL_1 = 'mensual_1',
  MENSUAL_2 = 'mensual_2',
  MENSUAL_3 = 'mensual_3',
}

@Entity()
@Index(['slot', 'status'], { where: "status = 'completed'" }) // Query #1: find latest backup per slot
@Index(['frequency', 'createdAt'], { where: "status = 'completed'" }) // Query #2,3: list/count by frequency
@Index(['createdAt']) // General ordering for admin lists
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: BackupType })
  type: BackupType;

  @Column({ type: 'enum', enum: BackupFrequency })
  frequency: BackupFrequency;

  @Column({ type: 'enum', enum: BackupSlot })
  slot: BackupSlot;

  @Column({ type: 'enum', enum: BackupStatus, default: BackupStatus.PENDING })
  status: BackupStatus;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ default: false })
  needsDownload: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}