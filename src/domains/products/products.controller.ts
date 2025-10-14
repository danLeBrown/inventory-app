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
import { UnauthenticatedRoute } from '../authentication/decorators/unauthenticated.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { SearchAndPaginateProductDto } from './dto/query-and-paginate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@UnauthenticatedRoute()
@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('')
  @ApiCreatedResponse({
    description: 'The product has been created.',
    type: ProductDto,
  })
  @AuditLog({
    action: 'Create product',
  })
  //   @ApiOkResponse({
  //     description: 'status updated successfully',
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         message: {
  //           type: 'string',
  //           example: 'status updated successfully',
  //         },
  //       },
  //     },
  //   })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @Get('')
  @ApiOkResponse({
    description: 'List of products',
    isArray: true,
    type: [ProductDto],
  })
  @AuditLog({
    action: 'Query products',
  })
  async searchAndFindBy(@Query() query: SearchAndPaginateProductDto) {
    const [data, total] = await this.productsService.searchAndFindBy(query);

    return new PaginatedDto(ProductDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The product has been found.',
    type: ProductDto,
  })
  @AuditLog({
    action: 'Get product by ID',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.productsService.findByIdOrFail(id);

    return {
      data: data.toDto(),
    };
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'The product has been updated.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product updated successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update product',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    await this.productsService.update(id, dto);

    return {
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'The product has been deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product deleted successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete product',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.delete(id);

    return {
      message: 'Product deleted successfully',
    };
  }
}
