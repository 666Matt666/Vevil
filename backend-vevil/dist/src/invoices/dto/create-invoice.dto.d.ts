export declare class CreateInvoiceItemDto {
    productId: number;
    quantity: number;
    discountPercent?: number;
}
export declare class CreateInvoiceDto {
    customerId: number;
    currency?: string;
    status?: string;
    items: CreateInvoiceItemDto[];
    notes?: string;
    discountPercent?: number;
    dueDate?: string;
}
