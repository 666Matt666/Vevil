import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '@/users/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  hashedRefreshToken?: string | null;

  @IsString()
  @IsOptional()
  avatarPath?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  password?: string;
}