import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Customer, { eager: true })
    customer: Customer;

    @Column()
    customerId: number;

    @CreateDateColumn()
    date: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items: InvoiceItem[];
}
