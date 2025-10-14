import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { SupplierDto } from '../dto/supplier.dto';

@Entity({ name: 'suppliers' })
@SetDto(SupplierDto)
export class Supplier extends BaseEntity<SupplierDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  contact_information: string;
}
