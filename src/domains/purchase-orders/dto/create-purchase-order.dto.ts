import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsUUID } from 'class-validator';

import { PURCHASE_ORDER_STATUS, PurchaseOrderStatus } from '../types';

export class CreatePurchaseOrderDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product being ordered',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the supplier',
  })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description:
      'The unique identifier for the warehouse where the order will be stored',
  })
  @IsUUID()
  warehouse_id: string;

  @ApiProperty({
    example: 100,
    description: 'The quantity of the product ordered',
  })
  @IsPositive()
  quantity_ordered: number;

  @ApiProperty({
    example: 'pending',
    description: 'The status of the purchase order',
    enum: Object.values(PURCHASE_ORDER_STATUS),
    default: 'pending',
  })
  status?: PurchaseOrderStatus;
}

export class CreatePurchaseOrderFromProductDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product being ordered',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    example: 100,
    description: 'The quantity of the product ordered',
    required: false,
  })
  @IsOptional()
  @IsPositive()
  quantity_ordered?: number;
}
