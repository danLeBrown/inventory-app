import { IntersectionType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateSupplierDto } from './create-supplier.dto';

export class QuerySupplierDto extends IntersectionType(
  PartialType(CreateSupplierDto),
  QueryDto,
) {}

export class SearchSupplierDto extends IntersectionType(
  PartialType(SearchDto),
  QuerySupplierDto,
) {}
