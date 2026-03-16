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
  ) {}

  async log(payload: AuditPayload): Promise<AuditLog> {
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
  async findRecent(limit = 50): Promise<AuditLog[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
