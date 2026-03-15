import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

export type StockMovementType = 'in' | 'out';
export type StockMovementReason =
  | 'purchase'   // compra
  | 'adjustment_in'
  | 'adjustment_out'
  | 'sale';      // venta (factura)

@Entity('stock_movement')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column()
  productId: number;

  @Column({ length: 3 })
  type: StockMovementType;

  @Column('int')
  quantity: number;

  @Column({ length: 30 })
  reason: StockMovementReason;

  @Column({ nullable: true })
  note: string | null;

  /** ID de factura cuando reason = 'sale' */
  @Column('int', { nullable: true })
  invoiceId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
