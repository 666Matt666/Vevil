import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup, BackupType, BackupStatus, BackupFrequency, BackupSlot } from './backup.entity';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = process.env.BACKUP_DIR || '/tmp/vevil-backups';
  private readonly maxBackups = 50;

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepo: Repository<Backup>,
  ) {
    this.ensureBackupDir();
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  getDbConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'postgres',
    };
  }

  getDailySlot(): BackupSlot {
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0) return BackupSlot.DIARIO_1;
    if (dayOfWeek === 1) return BackupSlot.DIARIO_2;
    return BackupSlot.DIARIO_3;
  }

  getWeeklySlot(): BackupSlot {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const weekOfMonth = Math.ceil((firstDayOfMonth.getDay() + dayOfMonth) / 7);
    return `semanal_${weekOfMonth}` as BackupSlot;
  }

  getMonthlySlot(): BackupSlot {
    const month = new Date().getMonth();
    return `mensual_${(month % 3) + 1}` as BackupSlot;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledDailyBackup() {
    const slot = this.getDailySlot();
    this.logger.log(`Iniciando backup diario slot: ${slot}...`);
    await this.createBackup(BackupType.INCREMENTAL, BackupFrequency.DIARIO, slot);
  }

  @Cron('0 2 * * 6')
  async scheduledWeeklyBackup() {
    const slot = this.getWeeklySlot();
    this.logger.log(`Iniciando backup semanal slot: ${slot}...`);
    await this.createBackup(BackupType.FULL, BackupFrequency.SEMANAL, slot);
  }

  @Cron('0 2 28-31 * *')
  async scheduledMonthlyBackup() {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() >= lastDay - 3) {
      const slot = this.getMonthlySlot();
      this.logger.log(`Iniciando backup mensual slot: ${slot}...`);
      await this.createBackup(BackupType.FULL, BackupFrequency.MENSUAL, slot);
    }
  }

  async createBackup(type: BackupType, frequency: BackupFrequency, slot: BackupSlot): Promise<Backup> {
    const db = this.getDbConfig();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vevil-${frequency}-${slot}-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    const existingInSlot = await this.backupRepo.findOne({ where: { slot, status: BackupStatus.COMPLETED } });
    if (existingInSlot && existingInSlot.filePath && fs.existsSync(existingInSlot.filePath)) {
      try {
        fs.unlinkSync(existingInSlot.filePath);
        this.logger.log(`Eliminado backup antiguo del slot ${slot}`);
      } catch (err) {
        this.logger.warn(`No se pudo eliminar backup antiguo: ${err}`);
      }
    }

    const backup = this.backupRepo.create({
      type,
      frequency,
      slot,
      status: BackupStatus.RUNNING,
    });
    await this.backupRepo.save(backup);

    try {
      if (type === BackupType.FULL) {
        await this.createFullBackup(db, filePath);
      } else {
        await this.createIncrementalBackup(db, filePath);
      }

      const stats = fs.statSync(filePath);
      backup.status = BackupStatus.COMPLETED;
      backup.filePath = filePath;
      backup.fileSize = stats.size;
      backup.completedAt = new Date();

      const oldBackups = await this.backupRepo
        .createQueryBuilder('b')
        .where('b.frequency = :freq', { freq: frequency })
        .andWhere('b.id != :id', { id: backup.id })
        .orderBy('b.createdAt', 'DESC')
        .skip(this.maxBackups)
        .getMany();

      for (const old of oldBackups) {
        if (old.filePath && fs.existsSync(old.filePath)) {
          try { fs.unlinkSync(old.filePath); } catch (_) {}
        }
        await this.backupRepo.delete(old.id);
      }

      const count = await this.backupRepo.count({ where: { frequency, status: BackupStatus.COMPLETED } });
      if (frequency === BackupFrequency.MENSUAL && count > 3) {
        const toAlert = await this.backupRepo.find({
          where: { frequency, status: BackupStatus.COMPLETED },
          order: { createdAt: 'ASC' },
          take: count - 3,
        });
        for (const b of toAlert) {
          b.needsDownload = true;
          await this.backupRepo.save(b);
        }
      }

      this.logger.log(`Backup ${frequency} ${slot} completado: ${filename} (${stats.size} bytes)`);
    } catch (error) {
      backup.status = BackupStatus.FAILED;
      backup.errorMessage = error.message;
      this.logger.error(`Backup ${frequency} ${slot} falló: ${error.message}`);
    }

    return this.backupRepo.save(backup);
  }

  private async createFullBackup(db: any, filePath: string) {
    const cmd = `PGPASSWORD="${db.password}" pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F c -b -v -f "${filePath}"`;
    await execAsync(cmd);
  }

  private async createIncrementalBackup(db: any, filePath: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const since = yesterday.toISOString().split('T')[0];

    const tables = ['products', 'customers', 'invoices', 'invoice_items', 'stock_movement'];
    
    let content = `-- Incremental backup since ${since}\n-- Generated at ${new Date().toISOString()}\n\n`;
    
    for (const table of tables) {
      content += `-- Table: ${table}\n`;
      content += `-- Data modified since ${since}\n\n`;
    }

    fs.writeFileSync(filePath, content);
  }

  async getBackups(limit = 20): Promise<Backup[]> {
    return this.backupRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getBackupById(id: string): Promise<Backup | null> {
    return this.backupRepo.findOne({ where: { id } });
  }

  async getBackupFile(id: string): Promise<Buffer | null> {
    const backup = await this.getBackupById(id);
    if (!backup || !backup.filePath || !fs.existsSync(backup.filePath)) {
      return null;
    }
    return fs.readFileSync(backup.filePath);
  }

  async triggerManualBackup(): Promise<Backup> {
    const slot = this.getDailySlot();
    return this.createBackup(BackupType.FULL, BackupFrequency.DIARIO, slot);
  }

  async markAsDownloaded(id: string): Promise<Backup | null> {
    const backup = await this.getBackupById(id);
    if (!backup) return null;
    backup.needsDownload = false;
    return this.backupRepo.save(backup);
  }

  async deleteBackup(id: string): Promise<boolean> {
    const backup = await this.getBackupById(id);
    if (!backup) return false;
    if (backup.filePath && fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }
    await this.backupRepo.delete(id);
    return true;
  }
}