import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty({
    example: 'John',
    description: 'Search query for name or other relevant fields',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search_query?: string;
}
