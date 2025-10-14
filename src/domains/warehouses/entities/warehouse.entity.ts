import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../common/base.entity';
import { SetDto } from '../../../decorators/set-dto.decorator';
import { WarehouseDto } from '../dto/warehouse.dto';

@Entity({ name: 'warehouses' })
@SetDto(WarehouseDto)
export class Warehouse extends BaseEntity<WarehouseDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  quantity_in_stock: number;
}
