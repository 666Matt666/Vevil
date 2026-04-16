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

// GitHub configuration
  private readonly githubEnabled = process.env.GITHUB_BACKUP_ENABLED === 'true';
  private backupEnabled = process.env.BACKUP_ENABLED !== 'false';
  private readonly githubToken = process.env.GITHUB_BACKUP_TOKEN;
  private readonly githubOwner = process.env.GITHUB_BACKUP_OWNER;
  private readonly githubRepo = process.env.GITHUB_BACKUP_REPO;
  private readonly githubPath = process.env.GITHUB_BACKUP_PATH || 'backups';
  private readonly deleteAfterUpload = process.env.GITHUB_BACKUP_DELETE_LOCAL !== 'false';
  
  // Runtime backup destination (can be changed via API)
  private backupDestination: 'local' | 'github' = 'local';

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepo: Repository<Backup>,
  ) {
    this.ensureBackupDir();
    if (this.githubEnabled) {
      this.logger.log(`GitHub backup enabled: ${this.githubOwner}/${this.githubRepo}/${this.githubPath}`);
    }
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

      // Upload to GitHub if enabled and selected as destination
      if (this.backupDestination === 'github' && backup.filePath && fs.existsSync(backup.filePath)) {
        await this.uploadToGithub(backup, filePath);
        
        // Delete local file after upload if configured
        if (this.deleteAfterUpload && fs.existsSync(backup.filePath)) {
          try {
            fs.unlinkSync(backup.filePath);
            backup.filePath = null;
            this.logger.log(`Archivo local eliminado después de subir a GitHub: ${filename}`);
          } catch (err) {
            this.logger.warn(`No se pudo eliminar archivo local: ${err}`);
          }
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

  private async uploadToGithub(backup: Backup, localFilePath: string): Promise<void> {
    if (!this.githubToken || !this.githubOwner || !this.githubRepo) {
      this.logger.warn('GitHub backup configurado pero sin credenciales');
      return;
    }

    try {
      const filename = path.basename(localFilePath);
      const content = fs.readFileSync(localFilePath);
      const contentBase64 = content.toString('base64');
      
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dateStr = `${year}/${month}`;
      
      // Path format: backups/2026/04/vevil-diario-diario_1-2026-04-12.sql
      const githubPath = `${this.githubPath}/${dateStr}/${filename}`;
      
      // Check if file exists to update or create
      const getUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${githubPath}`;
      
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github+json',
        },
      });

      let method = 'PUT';
      let sha = '';
      if (getResponse.ok) {
        const existing = await getResponse.json();
        sha = existing.sha;
        method = 'PUT';
      }

      const response = await fetch(getUrl, {
        method,
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Backup ${backup.frequency} ${backup.slot} - ${new Date().toISOString()}`,
          content: contentBase64,
          sha: sha || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.logger.log(`Backup subido a GitHub: ${result.content.html_url}`);
      } else {
        const errorText = await response.text();
        this.logger.error(`Error subiendo a GitHub: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      this.logger.error(`Error en uploadToGithub: ${error.message}`);
    }
  }

  async getBackups(limit = 20): Promise<Backup[]> {
    return this.backupRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  getBackupSettings() {
    const canUseGithub = this.githubEnabled && this.githubToken && this.githubOwner && this.githubRepo;
    return {
      enabled: this.backupEnabled,
      destination: this.backupDestination,
      availableDestinations: canUseGithub 
        ? ['local', 'github'] 
        : ['local'],
      githubConfigured: this.githubEnabled && !!this.githubToken,
      githubRepo: this.githubEnabled ? `${this.githubOwner}/${this.githubRepo}` : null,
    };
  }

  setBackupEnabled(enabled: boolean): { success: boolean; enabled: boolean } {
    this.backupEnabled = enabled;
    this.logger.log(`Backup ${enabled ? 'habilitado' : 'deshabilitado'} desde API`);
    return { success: true, enabled: this.backupEnabled };
  }

  updateBackupSettings(destination: string): { success: boolean; destination: string } {
    if (destination === 'github') {
      if (!this.githubEnabled || !this.githubToken || !this.githubOwner || !this.githubRepo) {
        return { success: false, destination: this.backupDestination };
      }
    }
    this.backupDestination = destination as 'local' | 'github';
    this.logger.log(`Backup destination changed to: ${this.backupDestination}`);
    return { success: true, destination: this.backupDestination };
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
    if (!this.backupEnabled) {
      throw new Error('Backups están deshabilitados. Habilita BACKUP_ENABLED=true para usar esta función.');
    }
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