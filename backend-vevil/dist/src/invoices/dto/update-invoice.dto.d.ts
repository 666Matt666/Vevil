export declare class UpdateInvoiceItemDto {
    productId?: number;
    quantity?: number;
    priceAtSale?: number;
    discountPercent?: number;
}
export declare class UpdateInvoiceDto {
    customerId?: number;
    currency?: string;
    status?: 'pending' | 'paid' | 'cancelled';
    items?: UpdateInvoiceItemDto[];
    notes?: string;
    discountPercent?: number;
    dueDate?: string;
}
