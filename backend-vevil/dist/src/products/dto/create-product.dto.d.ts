export declare class CreateProductDto {
    name: string;
    type: string;
    price: number;
    costPrice?: number | null;
    currency?: string;
    stock: number;
    minStock?: number;
    category?: string | null;
    description?: string;
}
