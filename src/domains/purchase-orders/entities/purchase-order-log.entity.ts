import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { PurchaseOrderLogDto } from '../dto/purchase-order-log.dto';
import { PurchaseOrderLogGroup, PurchaseOrderLogTag } from '../types';

@Entity({ name: 'purchase_order_logs' })
@SetDto(PurchaseOrderLogDto)
export class PurchaseOrderLog extends BaseEntity<PurchaseOrderLogDto> {
  @Column({ type: 'uuid' })
  purchase_order_id: string;

  @Column({ type: 'varchar', length: 255 })
  group: PurchaseOrderLogGroup;

  @Column({ type: 'varchar', length: 255 })
  tag: PurchaseOrderLogTag;

  @Column({ type: 'text' })
  value: string;
}
