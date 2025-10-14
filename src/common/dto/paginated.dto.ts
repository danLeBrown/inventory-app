import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<TData> {
  @ApiProperty({
    description: 'Array of items for the current page',
    type: [Object],
  })
  data: TData[];

  @ApiProperty({
    description: 'Total number of items available',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  constructor(
    data: TData[],
    meta: { total: number; limit: number; page: number },
  ) {
    this.data = data;
    this.total = Number(meta.total);
    this.limit = Number(meta.limit);
    this.page = Number(meta.page);
  }
}
