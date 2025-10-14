import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { ProductDto } from '../../products/dto/product.dto';

@Entity({ name: 'product_suppliers' })
@SetDto(ProductDto)
export class ProductSupplier extends BaseEntity<ProductDto> {
  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'int' })
  lead_time_in_days: number;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;
}
