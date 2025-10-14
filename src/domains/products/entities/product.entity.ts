import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { ProductDto } from '../dto/product.dto';

@Entity({ name: 'products' })
@SetDto(ProductDto)
export class Product extends BaseEntity<ProductDto> {
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  reorder_threshold: number;

  @Column({ type: 'int' })
  quantity_in_stock: number;
}
