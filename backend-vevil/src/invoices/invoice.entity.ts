import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

@Entity()
@Index(['customerId'])
@Index(['date'])
@Index(['status'])
@Index(['customerId', 'status'])
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

    /** Notas u observaciones de la factura */
    @Column({ type: 'text', nullable: true })
    notes: string | null;

    /** Descuento global aplicado (porcentaje 0-100) */
    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    discountPercent: number;

    /** Fecha de vencimiento de la factura */
    @Column({ type: 'date', nullable: true })
    dueDate: Date | null;
}
