import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from '@/domains/products/entities/product.entity';

import { BaseEntity } from '../../../common/base.entity';
import { SetDto } from '../../../decorators/set-dto.decorator';
import { WarehouseStockDto } from '../dto/warehouse-stock.dto';

@Entity({ name: 'warehouse_stocks' })
@SetDto(WarehouseStockDto)
export class WarehouseStock extends BaseEntity<WarehouseStockDto> {
  @Column({ type: 'uuid' })
  warehouse_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product?: Product;
}
