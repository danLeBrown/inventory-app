import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Product } from '../entities/product.entity';

export class ProductDto extends BaseDto {
  @ApiProperty({
    example: 'PROD-001',
    description: 'The unique identifier for the product (SKU)',
  })
  sku: string;

  @ApiProperty({
    example: 'Sample Product',
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'This is a sample product description.',
    description: 'A brief description of the product',
  })
  description: string;

  @ApiProperty({
    example: 5,
    description: 'The minimum stock level before reordering',
  })
  reorder_threshold: number;

  @ApiProperty({
    example: 100,
    description: 'The current quantity in stock',
  })
  quantity_in_stock: number;

  constructor(partial: Product) {
    super(partial);
    this.sku = partial.sku;
    this.name = partial.name;
    this.description = partial.description;
    this.reorder_threshold = partial.reorder_threshold;
    this.quantity_in_stock = partial.quantity_in_stock;
  }
}
