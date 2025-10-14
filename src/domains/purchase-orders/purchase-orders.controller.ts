import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';

import { AuditLog } from '../audit-logs/decorators/audit-log.decorator';
import { UnauthenticatedRoute } from '../authentication/decorators/unauthenticated.decorator';
import { PurchaseOrderDto } from './dto/purchase-order.dto';
import { PurchaseOrderLogDto } from './dto/purchase-order-log.dto';
import { QueryAndPaginatePurchaseOrderDto } from './dto/query-and-paginate-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';

@UnauthenticatedRoute()
@Controller({ path: 'purchase-orders', version: '1' })
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post('products/:product_id')
  @ApiCreatedResponse({
    description: 'The purchase order has been created.',
    type: PurchaseOrderDto,
  })
  @AuditLog({
    action: 'Create purchase order',
  })
  async create(@Param('product_id', ParseUUIDPipe) product_id: string) {
    const data = await this.purchaseOrdersService.create(product_id);

    return {
      data: data.toDto(),
    };
  }

  @Get('')
  @ApiOkResponse({
    description: 'List of purchase orders',
    isArray: true,
    type: [PurchaseOrderDto],
  })
  @AuditLog({
    action: 'Query purchase orders',
  })
  async searchAndFindBy(@Query() query: QueryAndPaginatePurchaseOrderDto) {
    const [data, total] =
      await this.purchaseOrdersService.searchAndFindBy(query);

    return new PaginatedDto(PurchaseOrderDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @Get(':id/history')
  @ApiOkResponse({
    description: 'The purchase order history has been found.',
    type: [PurchaseOrderLogDto],
  })
  @AuditLog({
    action: 'Get purchase order history by ID',
  })
  async findHistoryById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.purchaseOrdersService.findHistory(id);

    return {
      data: PurchaseOrderLogDto.collection(data),
    };
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The purchase order has been found.',
    type: PurchaseOrderDto,
  })
  @AuditLog({
    action: 'Get purchase order by ID',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.purchaseOrdersService.findByIdOrFail(id);

    return {
      data: data.toDto(),
    };
  }

  @Patch(':id/receive')
  @ApiOkResponse({
    description: 'The purchase order has been updated as received.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Purchase order updated as received successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update purchase order as received',
  })
  async update(@Param('id', ParseUUIDPipe) id: string) {
    await this.purchaseOrdersService.updateAsReceived(id);

    return {
      message: 'Purchase order updated as received successfully',
    };
  }

  @Patch(':id/cancel')
  @ApiOkResponse({
    description: 'The purchase order has been cancelled.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Purchase order cancelled successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Cancel purchase order',
  })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    await this.purchaseOrdersService.updateAsCancelled(id);

    return {
      message: 'Purchase order cancelled successfully',
    };
  }
}
