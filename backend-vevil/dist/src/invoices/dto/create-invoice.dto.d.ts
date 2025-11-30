export declare class CreateInvoiceItemDto {
    productId: number;
    quantity: number;
}
export declare class CreateInvoiceDto {
    customerId: number;
    items: CreateInvoiceItemDto[];
}
