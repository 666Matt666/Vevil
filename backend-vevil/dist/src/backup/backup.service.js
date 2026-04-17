"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const backup_entity_1 = require("./backup.entity");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    constructor(backupRepo) {
        this.backupRepo = backupRepo;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.backupDir = process.env.BACKUP_DIR || '/tmp/vevil-backups';
        this.maxBackups = 50;
        this.githubEnabled = process.env.GITHUB_BACKUP_ENABLED === 'true';
        this.backupEnabled = process.env.BACKUP_ENABLED !== 'false';
        this.githubToken = process.env.GITHUB_BACKUP_TOKEN;
        this.githubOwner = process.env.GITHUB_BACKUP_OWNER;
        this.githubRepo = process.env.GITHUB_BACKUP_REPO;
        this.githubPath = process.env.GITHUB_BACKUP_PATH || 'backups';
        this.deleteAfterUpload = process.env.GITHUB_BACKUP_DELETE_LOCAL !== 'false';
        this.backupDestination = 'local';
        this.ensureBackupDir();
        if (this.githubEnabled) {
            this.logger.log(`GitHub backup enabled: ${this.githubOwner}/${this.githubRepo}/${this.githubPath}`);
        }
    }
    ensureBackupDir() {
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
    getDailySlot() {
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 0)
            return backup_entity_1.BackupSlot.DIARIO_1;
        if (dayOfWeek === 1)
            return backup_entity_1.BackupSlot.DIARIO_2;
        return backup_entity_1.BackupSlot.DIARIO_3;
    }
    getWeeklySlot() {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dayOfMonth = now.getDate();
        const weekOfMonth = Math.ceil((firstDayOfMonth.getDay() + dayOfMonth) / 7);
        return `semanal_${weekOfMonth}`;
    }
    getMonthlySlot() {
        const month = new Date().getMonth();
        return `mensual_${(month % 3) + 1}`;
    }
    async scheduledDailyBackup() {
        if (!this.backupEnabled) {
            this.logger.log('Backup deshabilitado, saltando backup diario');
            return;
        }
        const slot = this.getDailySlot();
        this.logger.log(`Iniciando backup diario slot: ${slot}...`);
        await this.createBackup(backup_entity_1.BackupType.INCREMENTAL, backup_entity_1.BackupFrequency.DIARIO, slot);
    }
    async scheduledWeeklyBackup() {
        if (!this.backupEnabled) {
            this.logger.log('Backup deshabilitado, saltando backup semanal');
            return;
        }
        const slot = this.getWeeklySlot();
        this.logger.log(`Iniciando backup semanal slot: ${slot}...`);
        await this.createBackup(backup_entity_1.BackupType.FULL, backup_entity_1.BackupFrequency.SEMANAL, slot);
    }
    async scheduledMonthlyBackup() {
        if (!this.backupEnabled) {
            this.logger.log('Backup deshabilitado, saltando backup mensual');
            return;
        }
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (today.getDate() >= lastDay - 3) {
            const slot = this.getMonthlySlot();
            this.logger.log(`Iniciando backup mensual slot: ${slot}...`);
            await this.createBackup(backup_entity_1.BackupType.FULL, backup_entity_1.BackupFrequency.MENSUAL, slot);
        }
    }
    async createBackup(type, frequency, slot) {
        const db = this.getDbConfig();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `vevil-${frequency}-${slot}-${timestamp}.sql`;
        const filePath = path.join(this.backupDir, filename);
        const existingInSlot = await this.backupRepo.findOne({ where: { slot, status: backup_entity_1.BackupStatus.COMPLETED } });
        if (existingInSlot && existingInSlot.filePath && fs.existsSync(existingInSlot.filePath)) {
            try {
                fs.unlinkSync(existingInSlot.filePath);
                this.logger.log(`Eliminado backup antiguo del slot ${slot}`);
            }
            catch (err) {
                this.logger.warn(`No se pudo eliminar backup antiguo: ${err}`);
            }
        }
        const backup = this.backupRepo.create({
            type,
            frequency,
            slot,
            status: backup_entity_1.BackupStatus.RUNNING,
        });
        await this.backupRepo.save(backup);
        try {
            if (type === backup_entity_1.BackupType.FULL) {
                await this.createFullBackup(db, filePath);
            }
            else {
                await this.createIncrementalBackup(db, filePath);
            }
            const stats = fs.statSync(filePath);
            backup.status = backup_entity_1.BackupStatus.COMPLETED;
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
                    try {
                        fs.unlinkSync(old.filePath);
                    }
                    catch (_) { }
                }
                await this.backupRepo.delete(old.id);
            }
            const count = await this.backupRepo.count({ where: { frequency, status: backup_entity_1.BackupStatus.COMPLETED } });
            if (frequency === backup_entity_1.BackupFrequency.MENSUAL && count > 3) {
                const toAlert = await this.backupRepo.find({
                    where: { frequency, status: backup_entity_1.BackupStatus.COMPLETED },
                    order: { createdAt: 'ASC' },
                    take: count - 3,
                });
                for (const b of toAlert) {
                    b.needsDownload = true;
                    await this.backupRepo.save(b);
                }
            }
            if (this.backupDestination === 'github' && backup.filePath && fs.existsSync(backup.filePath)) {
                await this.uploadToGithub(backup, filePath);
                if (this.deleteAfterUpload && fs.existsSync(backup.filePath)) {
                    try {
                        fs.unlinkSync(backup.filePath);
                        backup.filePath = null;
                        this.logger.log(`Archivo local eliminado después de subir a GitHub: ${filename}`);
                    }
                    catch (err) {
                        this.logger.warn(`No se pudo eliminar archivo local: ${err}`);
                    }
                }
            }
            this.logger.log(`Backup ${frequency} ${slot} completado: ${filename} (${stats.size} bytes)`);
        }
        catch (error) {
            backup.status = backup_entity_1.BackupStatus.FAILED;
            backup.errorMessage = error.message;
            this.logger.error(`Backup ${frequency} ${slot} falló: ${error.message}`);
        }
        return this.backupRepo.save(backup);
    }
    async createFullBackup(db, filePath) {
        const cmd = `PGPASSWORD="${db.password}" pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F c -b -v -f "${filePath}"`;
        await execAsync(cmd);
    }
    async createIncrementalBackup(db, filePath) {
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
    async uploadToGithub(backup, localFilePath) {
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
            const githubPath = `${this.githubPath}/${dateStr}/${filename}`;
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
            }
            else {
                const errorText = await response.text();
                this.logger.error(`Error subiendo a GitHub: ${response.status} - ${errorText}`);
            }
        }
        catch (error) {
            this.logger.error(`Error en uploadToGithub: ${error.message}`);
        }
    }
    async getBackups(limit = 20) {
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
    setBackupEnabled(enabled) {
        this.backupEnabled = enabled;
        this.logger.log(`Backup ${enabled ? 'habilitado' : 'deshabilitado'} desde API`);
        return { success: true, enabled: this.backupEnabled };
    }
    updateBackupSettings(destination) {
        if (destination === 'github') {
            if (!this.githubEnabled || !this.githubToken || !this.githubOwner || !this.githubRepo) {
                return { success: false, destination: this.backupDestination };
            }
        }
        this.backupDestination = destination;
        this.logger.log(`Backup destination changed to: ${this.backupDestination}`);
        return { success: true, destination: this.backupDestination };
    }
    async getBackupById(id) {
        return this.backupRepo.findOne({ where: { id } });
    }
    async getBackupFile(id) {
        const backup = await this.getBackupById(id);
        if (!backup || !backup.filePath || !fs.existsSync(backup.filePath)) {
            return null;
        }
        return fs.readFileSync(backup.filePath);
    }
    async triggerManualBackup() {
        if (!this.backupEnabled) {
            throw new Error('Backups están deshabilitados. Habilita BACKUP_ENABLED=true para usar esta función.');
        }
        const slot = this.getDailySlot();
        return this.createBackup(backup_entity_1.BackupType.FULL, backup_entity_1.BackupFrequency.DIARIO, slot);
    }
    async markAsDownloaded(id) {
        const backup = await this.getBackupById(id);
        if (!backup)
            return null;
        backup.needsDownload = false;
        return this.backupRepo.save(backup);
    }
    async deleteBackup(id) {
        const backup = await this.getBackupById(id);
        if (!backup)
            return false;
        if (backup.filePath && fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }
        await this.backupRepo.delete(id);
        return true;
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "scheduledDailyBackup", null);
__decorate([
    (0, schedule_1.Cron)('0 2 * * 6'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "scheduledWeeklyBackup", null);
__decorate([
    (0, schedule_1.Cron)('0 2 28-31 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "scheduledMonthlyBackup", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(backup_entity_1.Backup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BackupService);
//# sourceMappingURL=backup.service.js.map