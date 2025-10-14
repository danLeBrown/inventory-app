import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { ProductSupplier } from '../entities/product-supplier.entity';

export class ProductSupplierDto extends BaseDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product (UUID)',
  })
  product_id: string;

  @ApiProperty({
    example: 'a22cf815-3de8-123c-b2be-1b7de04bc123',
    description: 'The unique identifier for the supplier (UUID)',
  })
  supplier_id: string;

  @ApiProperty({
    example: 7,
    description: 'Lead time in days for the supplier to deliver the product',
  })
  lead_time_in_days: number;

  @ApiProperty({
    example: false,
    description: 'Indicates if this supplier is the default for the product',
  })
  is_default: boolean;

  constructor(partial: ProductSupplier) {
    super(partial);
    this.product_id = partial.product_id;
    this.supplier_id = partial.supplier_id;
    this.lead_time_in_days = partial.lead_time_in_days;
    this.is_default = partial.is_default;
  }
}
