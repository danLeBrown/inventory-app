import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PURCHASE_ORDER_STATUS, PurchaseOrderStatus } from '../types';

export class PurchaseOrderDto extends BaseDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the purchase order',
  })
  order_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the product being ordered',
  })
  product_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the supplier',
  })
  supplier_id: string;

  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description:
      'The unique identifier for the warehouse where the order will be stored',
  })
  warehouse_id: string;

  @ApiProperty({
    example: 100,
    description: 'The quantity of the product ordered',
  })
  quantity_ordered: number;

  @ApiProperty({
    example: 'pending',
    description: 'The status of the purchase order',
    enum: Object.values(PURCHASE_ORDER_STATUS),
  })
  status: PurchaseOrderStatus;

  @ApiProperty({
    example: 1628444000,
    description: 'The expected arrival date of the order (Unix timestamp)',
  })
  expected_to_arrive_at: number;

  constructor(partial: PurchaseOrder) {
    super(partial);
    this.order_id = partial.id;
    this.product_id = partial.product_id;
    this.supplier_id = partial.supplier_id;
    this.warehouse_id = partial.warehouse_id;
    this.quantity_ordered = partial.quantity_ordered;
    this.status = partial.status;
    this.expected_to_arrive_at = partial.expected_to_arrive_at;
  }
}
