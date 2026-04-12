import { Controller, Get, Post, Delete, Param, Res, Query, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupType, BackupFrequency, BackupSlot } from './backup.entity';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('backups')
@UseGuards(AuthGuard('jwt'))
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  async listBackups(
    @Query('frequency') frequency?: string,
    @Query('limit') limit?: string,
  ) {
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

  @Get(':id')
  async getBackup(@Param('id') id: string) {
    return this.backupService.getBackupById(id);
  }

  @Get(':id/content')
  async getBackupContent(@Param('id') id: string) {
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

  @Get(':id/download')
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
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

  @Post('trigger')
  async triggerBackup() {
    const backup = await this.backupService.triggerManualBackup();
    return backup;
  }

  @Post(':id/mark-downloaded')
  async markAsDownloaded(@Param('id') id: string) {
    return this.backupService.markAsDownloaded(id);
  }

  @Delete(':id')
  async deleteBackup(@Param('id') id: string) {
    const success = await this.backupService.deleteBackup(id);
    return { success };
  }
}