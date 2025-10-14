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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SearchAndPaginateSupplierDto } from './dto/query-and-paginate-supplier.dto';
import { SupplierDto } from './dto/supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@Controller({ path: 'suppliers', version: '1' })
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('')
  @ApiCreatedResponse({
    description: 'The supplier has been created.',
    type: SupplierDto,
  })
  @AuditLog({
    action: 'Create supplier',
  })
  async create(@Body() dto: CreateSupplierDto) {
    const data = await this.suppliersService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @Get('')
  @ApiOkResponse({
    description: 'List of suppliers',
    isArray: true,
    type: [SupplierDto],
  })
  @AuditLog({
    action: 'Query suppliers',
  })
  async searchAndFindBy(@Query() query: SearchAndPaginateSupplierDto) {
    const [data, total] = await this.suppliersService.searchAndFindBy(query);

    return new PaginatedDto(SupplierDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The supplier has been found.',
    type: SupplierDto,
  })
  @AuditLog({
    action: 'Get supplier by ID',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.suppliersService.findOneOrFail(id);

    return {
      data: data.toDto(),
    };
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'The supplier has been updated.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Supplier updated successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update supplier',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    await this.suppliersService.update(id, dto);

    return {
      message: 'Supplier updated successfully',
    };
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'The supplier has been deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Supplier deleted successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete supplier',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.suppliersService.delete(id);

    return {
      message: 'Supplier deleted successfully',
    };
  }
}
