import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsIn } from 'class-validator';

export class RequestRegistrationDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'García', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ enum: ['male', 'female'], required: false })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: 'male' | 'female';
}
