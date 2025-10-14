import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Supplier Name',
    description: 'The name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Supplier Address',
    description: 'The address of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  contact_information: string;
}
