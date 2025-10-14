import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class QueryDto {
  @ApiProperty({
    example: 1725800000,
    description: 'Timestamp to filter entities created after this time',
    required: false,
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  from_time?: number;

  @ApiProperty({
    example: 1725900000,
    description: 'Timestamp to filter entities created before this time',
    required: false,
  })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  to_time?: number;
}
