import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditPayload {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ip?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) { }

  /**
   * Genera una descripción legible de los cambios entre oldValue y newValue.
   */
  private describeChanges(oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null): string | null {
    if (!oldValue && !newValue) return null;
    if (!oldValue && newValue) return this.formatObject(newValue);
    if (oldValue && !newValue) return `Eliminó: ${this.formatObject(oldValue)}`;
    
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    for (const key of allKeys) {
      const oldVal = oldValue[key];
      const newVal = newValue[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        const label = this.humanizeKey(key);
        if (oldVal === undefined || oldVal === null) {
          changes.push(`+${label}: ${newVal}`);
        } else if (newVal === undefined || newVal === null) {
          changes.push(`-${label}`);
        } else {
          changes.push(`${label}: ${oldVal} → ${newVal}`);
        }
      }
    }
    
    return changes.length > 0 ? changes.join(', ') : null;
  }

  private humanizeKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .toLowerCase();
  }

  private formatObject(obj: Record<string, unknown>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${this.humanizeKey(k)}: ${v}`)
      .join(', ');
  }

  async log(payload: AuditPayload): Promise<AuditLog> {
    const changesDesc = this.describeChanges(payload.oldValue, payload.newValue);
    console.log('[AUDIT] Logging action:', payload.action, '| Entity:', payload.entityType, '| ID:', payload.entityId, '| User:', payload.userEmail);
    if (changesDesc) {
      console.log('[AUDIT] Changes:', changesDesc);
    }
    const entity = this.repo.create({
      userId: payload.userId ?? null,
      userEmail: payload.userEmail ?? null,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      oldValue: payload.oldValue ?? null,
      newValue: payload.newValue ?? null,
      ip: payload.ip ?? null,
    });
    return this.repo.save(entity);
  }

  /** Buscar por usuario (últimas N). */
  async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Buscar por entidad (historial de una factura, cliente, etc.). */
  async findByEntity(entityType: string, entityId: string, limit = 50): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Últimos N registros (para listado general). */
  async findRecent(limit = 50, offset = 0): Promise<AuditLog[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getTotalCount(filters?: { userId?: string; entityType?: string; entityId?: string }): Promise<number> {
    const qb = this.repo.createQueryBuilder('a');
    if (filters?.userId) qb.andWhere('a.userId = :userId', { userId: filters.userId });
    if (filters?.entityType) qb.andWhere('a.entityType = :entityType', { entityType: filters.entityType });
    if (filters?.entityId) qb.andWhere('a.entityId = :entityId', { entityId: filters.entityId });
    return qb.getCount();
  }
}
