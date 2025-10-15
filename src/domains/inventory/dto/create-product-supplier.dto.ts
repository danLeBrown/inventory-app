import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateProductSupplierDto {
  @ApiProperty({
    example: 'b3b7c8e2-1234-4f8a-9c2a-123456789abc',
    description: 'The UUID of the product',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 'a1b2c3d4-5678-4e9f-8b7c-987654321def',
    description: 'The UUID of the supplier',
  })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({
    example: 7,
    description: 'Lead time in days for the supplier to deliver the product',
  })
  @IsNumber()
  @IsPositive()
  lead_time_days: number;

  @ApiProperty({
    example: false,
    description: 'Whether this supplier is the default for the product',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

export class CreateProductSupplierOmitProductDto extends OmitType(
  CreateProductSupplierDto,
  ['product_id'] as const,
) {}
