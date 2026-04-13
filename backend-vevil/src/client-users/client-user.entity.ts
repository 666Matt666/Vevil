import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Entity()
@Index(['email'], { unique: true })
export class ClientUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    customerId: number;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}