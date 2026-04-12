"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const backup_service_1 = require("./backup.service");
const passport_1 = require("@nestjs/passport");
let BackupController = class BackupController {
    constructor(backupService) {
        this.backupService = backupService;
    }
    async listBackups(frequency, limit) {
        const backups = await this.backupService.getBackups(limit ? parseInt(limit) : 20);
        let filtered = backups;
        if (frequency) {
            filtered = backups.filter(b => b.frequency === frequency);
        }
        return {
            data: filtered,
            total: filtered.length,
        };
    }
    async getBackup(id) {
        return this.backupService.getBackupById(id);
    }
    async getBackupContent(id) {
        const backup = await this.backupService.getBackupById(id);
        if (!backup) {
            return { error: 'Backup not found' };
        }
        if (!backup.filePath || !require('fs').existsSync(backup.filePath)) {
            return { error: 'Backup file not found' };
        }
        const content = require('fs').readFileSync(backup.filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 200);
        return {
            backup,
            preview: lines.join('\n'),
            totalLines: content.split('\n').length,
        };
    }
    async downloadBackup(id, res) {
        const file = await this.backupService.getBackupFile(id);
        if (!file) {
            return res.status(404).json({ error: 'Backup file not found' });
        }
        const backup = await this.backupService.getBackupById(id);
        const filename = backup?.filePath?.split('/').pop() || 'backup.sql';
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(file);
    }
    async triggerBackup() {
        const backup = await this.backupService.triggerManualBackup();
        return backup;
    }
    async markAsDownloaded(id) {
        return this.backupService.markAsDownloaded(id);
    }
    async deleteBackup(id) {
        const success = await this.backupService.deleteBackup(id);
        return { success };
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('frequency')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "listBackups", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackup", null);
__decorate([
    (0, common_1.Get)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupContent", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "downloadBackup", null);
__decorate([
    (0, common_1.Post)('trigger'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "triggerBackup", null);
__decorate([
    (0, common_1.Post)(':id/mark-downloaded'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "markAsDownloaded", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteBackup", null);
exports.BackupController = BackupController = __decorate([
    (0, common_1.Controller)('backups'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupController);
//# sourceMappingURL=backup.controller.js.map