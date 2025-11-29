import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity'; // Asegúrate de que esta ruta sea correcta
import { Invoice } from './invoice.entity'; // Asegúrate de que esta ruta sea correcta

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  priceAtSale: number; // Precio del producto en el momento de la venta

  @ManyToOne(() => Product, (product) => product.invoiceItems, { eager: true })
  product: Product;

  @Column()
  productId: number; // Columna para la clave foránea de Product

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  invoiceId: number; // Columna para la clave foránea de Invoice

  // Puedes añadir un método para calcular el total del item
  getTotal(): number {
    return this.quantity * this.priceAtSale;
  }
}