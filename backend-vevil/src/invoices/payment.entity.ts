import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
    invoice: Invoice;

    @Column()
    invoiceId: number;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @CreateDateColumn()
    date: Date;

    @Column({ length: 50, nullable: true })
    method: string;
}
