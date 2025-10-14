import { IntersectionType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateWarehouseDto } from './create-warehouse.dto';

export class QueryWarehouseDto extends IntersectionType(
  PartialType(CreateWarehouseDto),
  QueryDto,
) {}

export class SearchWarehouseDto extends IntersectionType(
  PartialType(SearchDto),
  QueryWarehouseDto,
) {}
