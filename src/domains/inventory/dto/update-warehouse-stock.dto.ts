import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsPositive, IsUUID } from 'class-validator';

import {
  WAREHOUSE_STOCK_UPDATE_OPERATION,
  WarehouseStockUpdateOperation,
} from '../types';

export class UpdateWarehouseStockDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the warehouse',
  })
  @IsUUID()
  warehouse_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 500,
    description: 'The quantity of the product in stock at the warehouse',
  })
  @IsPositive()
  quantity: number;

  @ApiProperty({
    example: 'add',
    description:
      'The operation to perform on the stock quantity (add or subtract)',
  })
  @IsIn(Object.values(WAREHOUSE_STOCK_UPDATE_OPERATION))
  operation: WarehouseStockUpdateOperation;
}
