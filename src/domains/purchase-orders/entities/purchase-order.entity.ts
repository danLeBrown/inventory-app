import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { PurchaseOrderDto } from '../dto/purchase-order.dto';

@Entity({ name: 'purchase_orders' })
@SetDto(PurchaseOrderDto)
export class PurchaseOrder extends BaseEntity<PurchaseOrderDto> {
  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'uuid' })
  warehouse_id: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'received' | 'canceled';

  @Column({ type: 'int' })
  quantity_ordered: number;

  @Column({ type: 'bigint' })
  ordered_at: number;

  @Column({ type: 'bigint' })
  expected_to_arrive_at: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
  supplier: Supplier;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
  warehouse: Warehouse;
}
