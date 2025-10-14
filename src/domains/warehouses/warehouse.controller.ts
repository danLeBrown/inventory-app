import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';

import { AuditLog } from '../audit-logs/decorators/audit-log.decorator';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { SearchAndPaginateWarehouseDto } from './dto/query-and-paginate-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseDto } from './dto/warehouse.dto';
import { WarehousesService } from './warehouses.service';

@ApiTags('Warehouses')
@Controller({ path: 'warehouses', version: '1' })
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post('')
  @ApiCreatedResponse({
    description: 'The warehouse has been created.',
    type: WarehouseDto,
  })
  @AuditLog({
    action: 'Create warehouse',
  })
  async create(@Body() dto: CreateWarehouseDto) {
    const data = await this.warehousesService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @Get('')
  @ApiOkResponse({
    description: 'List of warehouses',
    isArray: true,
    type: [WarehouseDto],
  })
  @AuditLog({
    action: 'Query warehouses',
  })
  async searchAndFindBy(@Query() query: SearchAndPaginateWarehouseDto) {
    const [data, total] = await this.warehousesService.searchAndFindBy(query);

    return new PaginatedDto(WarehouseDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The warehouse has been found.',
    type: WarehouseDto,
  })
  @AuditLog({
    action: 'Get warehouse by ID',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.warehousesService.findOneOrFail(id);

    return {
      data: data.toDto(),
    };
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'The warehouse has been updated.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Warehouse updated successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update warehouse',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    await this.warehousesService.update(id, dto);

    return {
      message: 'Warehouse updated successfully',
    };
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'The warehouse has been deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Warehouse deleted successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete warehouse',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.warehousesService.delete(id);

    return {
      message: 'Warehouse deleted successfully',
    };
  }
}
