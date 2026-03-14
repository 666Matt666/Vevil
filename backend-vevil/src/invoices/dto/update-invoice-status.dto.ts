import { IsString, IsIn } from 'class-validator';

export class UpdateInvoiceStatusDto {
    @IsString()
    @IsIn(['pending', 'paid', 'cancelled'])
    status: string;
}
