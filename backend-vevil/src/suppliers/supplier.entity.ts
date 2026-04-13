import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['email'])
@Index(['name'])
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    phones: { type: string; number: string }[];

    @Column({ nullable: true })
    contact_person: string;

    @Column({ nullable: true })
    address_street: string;

    @Column({ nullable: true })
    address_city: string;

    @Column({ nullable: true })
    address_province: string;

    @Column({ nullable: true })
    tax_id: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}