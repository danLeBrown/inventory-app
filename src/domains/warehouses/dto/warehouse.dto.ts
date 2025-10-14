import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

import { BaseDto } from '../../../common/dto/base.dto';
import { Warehouse } from '../entities/warehouse.entity';

export class WarehouseDto extends BaseDto {
  @ApiProperty({
    example: 'Main Warehouse',
    description: 'The name of the warehouse',
  })
  name: string;

  @ApiProperty({
    example: 'Warehouse Location',
    description: 'The location of the warehouse',
  })
  location: string;

  @ApiProperty({
    example: 1000,
    description: 'The maximum capacity of the warehouse',
  })
  capacity: number;

  @ApiProperty({
    example: 500,
    description: 'The current quantity in stock at the warehouse',
  })
  quantity_in_stock: number;

  constructor(partial: Warehouse) {
    super(partial);
    this.name = partial.name;
    this.location = partial.location;
    this.capacity = partial.capacity;
    this.quantity_in_stock = partial.quantity_in_stock;
  }
}
