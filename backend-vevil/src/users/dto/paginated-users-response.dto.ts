import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/user.entity';

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ example: 100 })
  total: number;
}