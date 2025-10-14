import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { PurchaseOrderLog } from '../entities/purchase-order-log.entity';
import {
  PURCHASE_ORDER_LOG_GROUPS,
  PURCHASE_ORDER_LOG_TAGS,
  PurchaseOrderLogGroup,
  PurchaseOrderLogTag,
} from '../types';

export class PurchaseOrderLogDto extends BaseDto {
  @ApiProperty({
    example: 'f11bf815-4de8-424c-b2be-5b7de04ac615',
    description: 'The unique identifier for the purchase order',
  })
  purchase_order_id: string;

  @ApiProperty({
    example: 'status',
    description: 'The group/category of the log entry',
    enum: Object.values(PURCHASE_ORDER_LOG_GROUPS),
  })
  group: PurchaseOrderLogGroup;

  @ApiProperty({
    example: 'completed_at',
    description: 'The specific tag or action of the log entry',
    enum: Object.values(PURCHASE_ORDER_LOG_TAGS),
  })
  tag: PurchaseOrderLogTag;

  @ApiProperty({
    example: '1627849923',
    description:
      'The value associated with the log entry, typically a timestamp',
  })
  value: string;

  constructor(partial: PurchaseOrderLog) {
    super(partial);
    this.purchase_order_id = partial.purchase_order_id;
    this.group = partial.group;
    this.tag = partial.tag;
    this.value = partial.value;
  }
}
