import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PendingRegistrationStatus =
  | 'pending_email'   // Esperando que el usuario confirme el correo
  | 'pending_approval' // Correo confirmado, esperando que un admin apruebe
  | 'approved'        // Aprobado, usuario creado
  | 'rejected';       // Rechazado por un admin

@Entity('pending_registration')
export class PendingRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: 'male' | 'female';

  @Column({ nullable: true })
  emailConfirmationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailConfirmationExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailConfirmedAt?: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending_email' })
  status: PendingRegistrationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
