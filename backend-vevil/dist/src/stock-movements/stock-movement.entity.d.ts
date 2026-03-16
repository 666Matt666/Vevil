import { Product } from '../products/product.entity';
export type StockMovementType = 'in' | 'out';
export type StockMovementReason = 'purchase' | 'adjustment_in' | 'adjustment_out' | 'sale';
export declare class StockMovement {
    id: number;
    product: Product;
    productId: number;
    type: StockMovementType;
    quantity: number;
    reason: StockMovementReason;
    note: string | null;
    invoiceId: number | null;
    createdAt: Date;
}
