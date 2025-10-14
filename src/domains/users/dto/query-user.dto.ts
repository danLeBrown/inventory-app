import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateUserDto } from './create-user.dto';

export class QueryUserDto extends IntersectionType(
  OmitType(PartialType(CreateUserDto), ['first_name', 'last_name'] as const),
  QueryDto,
) {}

export class SearchUserDto extends IntersectionType(QueryUserDto, SearchDto) {}
