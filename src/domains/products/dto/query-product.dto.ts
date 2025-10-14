import { IntersectionType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateProductDto } from './create-product.dto';

export class QueryProductDto extends IntersectionType(
  PartialType(CreateProductDto),
  QueryDto,
) {}

export class SearchProductDto extends IntersectionType(
  PartialType(SearchDto),
  QueryProductDto,
) {}
