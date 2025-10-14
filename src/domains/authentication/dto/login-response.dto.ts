import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/domains/users/dto/user.dto';
import { User } from '@/domains/users/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6',
  })
  refresh_token: string;

  constructor(
    user: User,
    tokens: { access_token: string; refresh_token: string },
  ) {
    this.user = user.toDto();
    this.access_token = tokens.access_token;
    this.refresh_token = tokens.refresh_token;
  }
}
