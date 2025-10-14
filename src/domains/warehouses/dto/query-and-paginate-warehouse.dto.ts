import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryWarehouseDto, SearchWarehouseDto } from './query-warehouse.dto';

export class QueryAndPaginateWarehouseDto extends IntersectionType(
  QueryWarehouseDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateWarehouseDto extends IntersectionType(
  SearchWarehouseDto,
  PaginationDto,
  OrderByDto,
) {}
