export type StockMovementReasonDto = 'purchase' | 'adjustment_in' | 'adjustment_out';
export declare class CreateStockMovementDto {
    productId: number;
    type: 'in' | 'out';
    quantity: number;
    reason: StockMovementReasonDto;
    note?: string;
}
