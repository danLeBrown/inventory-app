import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryStockLevelDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description:
      'The unique identifier for the warehouse to filter stock levels',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  warehouse_id?: string;
}
