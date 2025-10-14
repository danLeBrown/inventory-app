import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AuditLogStatus } from '../types';
import { AuditLogDto } from './audit-log.dto';

export class CreateAuditLogDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: 'GET' })
  @IsString()
  method: string;

  @ApiProperty({ example: '/api/v1/resource' })
  @IsString()
  path: string;

  @ApiProperty({ example: '{"key": "value"}' })
  @IsOptional()
  @IsString()
  request_body: string | null;

  @ApiProperty({ example: 'Leads' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  action: string;

  @ApiProperty({ example: '127.0.0.1' })
  @IsString()
  ip_address: string;

  @ApiProperty({ example: 'Mozilla/5.0', nullable: true })
  @IsOptional()
  @IsString()
  user_agent?: string | null;

  @ApiProperty({ example: '{"key": "value"}' })
  @IsString()
  meta: string;

  @ApiProperty({ example: 'success' })
  @IsString()
  status: AuditLogStatus;

  @ApiProperty({ example: 200 })
  @IsNumber()
  status_code: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  duration_ms: number;
}

export class QueryAuditLogDto extends PartialType(
  PickType(AuditLogDto, [
    'user_id',
    'method',
    'path',
    'model',
    'action',
    'ip_address',
    'status',
    'status_code',
  ] as const),
) {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiProperty({
    example: 1725800000,
    description: 'Timestamp to filter leads created after this time',
    required: false,
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  from_time?: number;

  @ApiProperty({
    example: 1725900000,
    description: 'Timestamp to filter leads created before this time',
    required: false,
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  to_time?: number;
}
