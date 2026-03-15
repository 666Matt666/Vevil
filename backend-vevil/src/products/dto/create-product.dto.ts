import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    costPrice?: number | null;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsNumber()
    @Min(0)
    stock: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minStock?: number;

    @IsOptional()
    @IsString()
    category?: string | null;

    @IsOptional()
    @IsString()
    description?: string;
}
