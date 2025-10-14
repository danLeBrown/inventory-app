import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Supplier } from '../entities/supplier.entity';

export class SupplierDto extends BaseDto {
  @ApiProperty({
    example: 'Supplier Name',
    description: 'The name of the supplier',
  })
  name: string;

  @ApiProperty({
    example: 'Supplier Address',
    description: 'The address of the supplier',
  })
  contact_information: string;

  constructor(partial: Supplier) {
    super(partial);
    this.name = partial.name;
    this.contact_information = partial.contact_information;
  }
}
