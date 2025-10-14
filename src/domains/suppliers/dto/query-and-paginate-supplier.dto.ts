import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QuerySupplierDto, SearchSupplierDto } from './query-supplier.dto';

export class QueryAndPaginateSupplierDto extends IntersectionType(
  QuerySupplierDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateSupplierDto extends IntersectionType(
  SearchSupplierDto,
  PaginationDto,
  OrderByDto,
) {}
