import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { InvoiceItem } from '../invoices/invoice-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // 'fuel' | 'other'

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InvoiceItem, (item) => item.product)
  invoiceItems: InvoiceItem[];
}
