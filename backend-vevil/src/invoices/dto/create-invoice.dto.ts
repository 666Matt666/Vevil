import { IsNumber, IsArray, ValidateNested, IsOptional, IsString, IsIn, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
    @IsNumber()
    productId: number;

    @IsNumber()
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    quantity: number;
}

export class CreateInvoiceDto {
    @IsNumber()
    customerId: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    @IsIn(['pending', 'paid', 'cancelled'], { message: 'status debe ser pending, paid o cancelled' })
    status?: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe incluir al menos un ítem en la factura' })
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}
