import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

@Entity()
@Index(['customerId']) // Filtrado por cliente
@Index(['date']) // Filtrado por fecha
@Index(['status']) // Filtrado por estado
@Index(['customerId', 'status']) // Consulta de facturas por cliente y estado
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

    @Column({ length: 3, default: 'PYG' })
    currency: string;

    /** pending | paid | cancelled */
    @Column({ length: 20, default: 'pending' })
    status: string;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items: InvoiceItem[];

    @OneToMany(() => Payment, (p) => p.invoice)
    payments: Payment[];
}
