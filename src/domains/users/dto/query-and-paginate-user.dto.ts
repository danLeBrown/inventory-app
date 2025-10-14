import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryUserDto, SearchUserDto } from './query-user.dto';

export class QueryAndPaginateUserDto extends IntersectionType(
  QueryUserDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateUserDto extends IntersectionType(
  SearchUserDto,
  QueryAndPaginateUserDto,
) {}
