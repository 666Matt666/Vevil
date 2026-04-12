import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInvoiceItemDto {
    @IsOptional()
    @IsNumber()
    productId?: number;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsNumber()
    priceAtSale?: number;

    @IsOptional()
    @IsNumber()
    discountPercent?: number;
}

export class UpdateInvoiceDto {
    @IsOptional()
    @IsNumber()
    customerId?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    status?: 'pending' | 'paid' | 'cancelled';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateInvoiceItemDto)
    items?: UpdateInvoiceItemDto[];

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    discountPercent?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}