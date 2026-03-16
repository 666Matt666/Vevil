import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  /** Usuario que realizó la acción (uuid). Null si no autenticado (ej. registro público). */
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  /** Email del usuario en el momento de la acción (para consultas sin join). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string | null;

  /** Acción: invoice.created, customer.updated, auth.login, etc. */
  @Column({ type: 'varchar', length: 64 })
  action: string;

  /** Tipo de entidad afectada: invoice, customer, product, user, etc. */
  @Column({ type: 'varchar', length: 32 })
  entityType: string;

  /** ID de la entidad afectada (string para soportar uuid o number). */
  @Column({ type: 'varchar', length: 64, nullable: true })
  entityId: string | null;

  /** JSON con estado anterior (opcional). */
  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown> | null;

  /** JSON con estado nuevo (opcional). */
  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, unknown> | null;

  /** IP del request (opcional). */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
