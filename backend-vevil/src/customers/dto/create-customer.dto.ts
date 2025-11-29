import { IsString, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PhoneDto)
    phones?: PhoneDto[];

    @IsOptional()
    @IsString()
    address_street?: string;

    @IsOptional()
    @IsString()
    address_city?: string;

    @IsOptional()
    @IsString()
    address_province?: string;

    @IsOptional()
    @IsString()
    address_zip?: string;

    @IsOptional()
    @IsString()
    google_maps_link?: string;

    @IsOptional()
    @IsString()
    tax_id?: string;
}

export class PhoneDto {
    @IsString()
    type: string;

    @IsString()
    number: string;
}
