import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsNumber()
    price: number;

    @IsNumber()
    stock: number;

    @IsOptional()
    @IsString()
    description?: string;
}
