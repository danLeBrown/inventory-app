import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    example: 'Main Warehouse',
    description: 'The name of the warehouse',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Warehouse Location',
    description: 'The location of the warehouse',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 1000,
    description: 'The maximum capacity of the warehouse',
  })
  @IsPositive()
  capacity: number;
}
