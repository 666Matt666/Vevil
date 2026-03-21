import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { InvoiceItem } from '../invoices/invoice-item.entity';

@Entity()
@Index(['name']) // Búsqueda por nombre
@Index(['type']) // Filtrado por tipo
@Index(['category']) // Filtrado por categoría
@Index(['stock']) // Para alertas de stock bajo
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // 'fuel' | 'other'

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** Precio de costo (para calcular margen). Opcional. */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costPrice: number | null;

  @Column({ length: 3, default: 'PYG' })
  currency: string;

  @Column('int')
  stock: number;

  /** Stock mínimo deseado; si stock < minStock se considera alerta. 0 = no usar. */
  @Column('int', { default: 0 })
  minStock: number;

  /** Categoría del producto: fuel, lubricants, snacks, other, etc. */
  @Column({ length: 50, nullable: true })
  category: string | null;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InvoiceItem, (item) => item.product)
  invoiceItems: InvoiceItem[];
}
