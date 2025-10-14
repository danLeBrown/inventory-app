import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import {
  QueryPurchaseOrderDto,
  SearchPurchaseOrderDto,
} from './query-purchase-order.dto';

export class QueryAndPaginatePurchaseOrderDto extends IntersectionType(
  QueryPurchaseOrderDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginatePurchaseOrderDto extends IntersectionType(
  SearchPurchaseOrderDto,
  PaginationDto,
  OrderByDto,
) {}
