import { IsNumber, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
    @IsNumber()
    productId: number;

    @IsNumber()
    quantity: number;
}

export class CreateInvoiceDto {
    @IsNumber()
    customerId: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}
