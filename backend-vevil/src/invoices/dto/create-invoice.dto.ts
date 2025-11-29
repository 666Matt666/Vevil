import { IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}
