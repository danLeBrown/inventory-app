import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { UserDto } from '@/domains/users/dto/user.dto';

import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogStatus } from '../types';

export class AuditLogDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  user_id: string | null;

  @ApiProperty({ example: 'GET' })
  method: string;

  @ApiProperty({ example: '/api/v1/resource' })
  path: string;

  @ApiProperty({ example: '{"key": "value"}' })
  request_body: string | null;

  @ApiProperty({ example: 'Leads' })
  model: string;

  @ApiProperty({ example: 'create' })
  action: string;

  @ApiProperty({ example: '127.0.0.1' })
  ip_address: string;

  @ApiProperty({ example: 'Mozilla/5.0', nullable: true })
  user_agent: string | null;

  @ApiProperty({ example: '{"key": "value"}' })
  meta: string;

  @ApiProperty({ example: 'success' })
  status: AuditLogStatus;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 150 })
  duration_ms: number;

  @ApiProperty({ type: UserDto, nullable: true })
  user?: UserDto;

  constructor(auditLog: AuditLog) {
    super(auditLog);
    this.user_id = auditLog.user_id;
    this.method = auditLog.method;
    this.path = auditLog.path;
    this.request_body = auditLog.request_body;
    this.model = auditLog.model;
    this.action = auditLog.action;
    this.ip_address = auditLog.ip_address;
    this.user_agent = auditLog.user_agent;
    this.meta = auditLog.meta;
    this.status = auditLog.status;
    this.status_code = auditLog.status_code;
    this.duration_ms = auditLog.duration_ms;

    if (auditLog.user) {
      this.user = new UserDto(auditLog.user);
    }
  }
}
