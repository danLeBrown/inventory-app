import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { UserSession } from '../entities/user-session.entity';

export class UserSessionDto extends BaseDto {
  @ApiProperty({
    description: 'User ID',
    example: '1e437848-4018-492f-98d8-80e178645792',
  })
  user_id: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6',
  })
  refresh_token: string;

  @ApiProperty({
    example: 1681459200,
  })
  login_at: number;

  @ApiProperty({
    example: 1681459200,
  })
  expired_at: number;

  @ApiProperty({
    example: '127.0.0.1',
  })
  ip_address: string | null;

  @ApiProperty({
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  })
  user_agent: string | null;

  constructor(us: UserSession) {
    super(us);

    this.user_id = us.user_id;
    this.refresh_token = us.refresh_token;
    this.login_at = us.login_at;
    this.expired_at = us.expired_at;
    this.ip_address = us.ip_address;
    this.user_agent = us.user_agent;
  }
}
