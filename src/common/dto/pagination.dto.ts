import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.limit !== undefined)
  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false, allowNaN: false })
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.page !== undefined)
  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false, allowNaN: false })
  @Type(() => Number)
  @Min(0)
  page?: number;
}

export class OrderByDto {
  @ApiProperty({
    description: 'Field to order by',
    example: 'created_at',
    required: false,
  })
  @IsOptional()
  @IsIn(['name', 'created_at'])
  order_by?: 'name' | 'created_at';

  @ApiProperty({
    description: 'Order direction (asc or desc)',
    example: 'asc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order_direction?: 'asc' | 'desc';
}
