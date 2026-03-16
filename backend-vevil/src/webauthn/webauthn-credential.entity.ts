import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/user.entity';

@Entity('webauthn_credential')
export class WebAuthnCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  credentialId: string;

  @Column({ type: 'text' })
  publicKey: string;

  @Column({ type: 'int', default: 0 })
  counter: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType?: string;

  @CreateDateColumn()
  createdAt: Date;
}
