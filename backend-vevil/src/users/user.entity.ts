import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from './entities/user-role.enum';
import { Exclude } from 'class-transformer';

@Entity()
@Index(['email'], { unique: true }) // Búsquedas por email (login)
@Index(['role']) // Filtrado por rol
@Index(['createdAt']) // Ordenamiento por fecha
export class User {
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
  @Exclude() // Excluir por defecto en las respuestas
  password?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
