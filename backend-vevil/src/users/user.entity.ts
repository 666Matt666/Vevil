import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';


// Definimos los roles como un enum para mayor seguridad y consistencia
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  USER = 'user',
}

@Entity('users') // Esto le dice a TypeORM que cree una tabla llamada 'users'
export class User {
  @PrimaryGeneratedColumn('uuid') // Clave primaria autogenerada como UUID
  id: string;

  @Column({ unique: true, nullable: false }) // El email debe ser único y no puede ser nulo
  email: string;

  @Column({ nullable: false })
  name: string;

  @Column({ select: false }) // Por seguridad, la contraseña no se incluirá en las consultas SELECT por defecto
  password: string;

  @Column({ nullable: true, select: false }) // El refresh token puede ser nulo y no se selecciona por defecto
  hashedRefreshToken?: string;

  @Column({ nullable: true }) // Guardaremos la ruta o el nombre del archivo del avatar
  avatarPath?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // El rol por defecto será 'user'
  })
  role: UserRole;

  @CreateDateColumn() // Columna para la fecha de creación, gestionada automáticamente por TypeORM
  createdAt: Date;

  @UpdateDateColumn() // Columna para la fecha de última actualización, gestionada automáticamente
  updatedAt: Date;

}