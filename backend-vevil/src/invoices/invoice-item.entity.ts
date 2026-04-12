import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';
import { Invoice } from './invoice.entity';

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  priceAtSale: number;

  @ManyToOne(() => Product, (product) => product.invoiceItems, { eager: true })
  product: Product;

  @Column()
  productId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  invoiceId: number;

  /** Descuento por línea (porcentaje 0-100) */
  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'discountPercent' })
  discountPercent: number;

  getTotal(): number {
    const subtotal = this.quantity * this.priceAtSale;
    const discount = subtotal * (this.discountPercent / 100);
    return subtotal - discount;
  }
}