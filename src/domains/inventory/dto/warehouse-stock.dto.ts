import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { WarehouseStock } from '../entities/warehouse-stock.entity';

export class WarehouseStockDto extends BaseDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the warehouse',
  })
  warehouse_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product',
  })
  product_id: string;

  @ApiProperty({
    example: 500,
    description: 'The quantity of the product in stock at the warehouse',
  })
  quantity: number;

  constructor(data: WarehouseStock) {
    super(data);

    this.warehouse_id = data.warehouse_id;
    this.product_id = data.product_id;
    this.quantity = data.quantity;
  }
}
