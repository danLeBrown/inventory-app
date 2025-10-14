import { IntersectionType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class QueryPurchaseOrderDto extends IntersectionType(
  PartialType(CreatePurchaseOrderDto),
  QueryDto,
) {}

export class SearchPurchaseOrderDto extends IntersectionType(
  PartialType(SearchDto),
  QueryPurchaseOrderDto,
) {}
