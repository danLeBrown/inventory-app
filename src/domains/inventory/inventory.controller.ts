import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '../audit-logs/decorators/audit-log.decorator';
import { UnauthenticatedRoute } from '../authentication/decorators/unauthenticated.decorator';
import { QueryStockLevelDto } from '../inventory/dto/query-stock-level.dto';
import { UpdateProductStockLevelDto } from '../inventory/dto/update-product-stock-level.dto';
import { InventoryService } from './inventory.service';

@UnauthenticatedRoute()
@ApiTags('Inventory')
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products/:id/stocks')
  @ApiOkResponse({
    description: 'The stock level for the product.',
    schema: {
      type: 'object',
      properties: {
        total_quantity: {
          type: 'number',
          example: 1500,
        },
      },
    },
  })
  @AuditLog({
    action: 'Get product stock level by ID',
  })
  async findStockLevel(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryStockLevelDto,
  ) {
    const data = await this.inventoryService.findProductStockLevel({
      ...query,
      product_id: id,
    });

    return {
      data: {
        total_quantity: data,
      },
    };
  }

  @Patch('products/:id/stocks')
  @ApiOkResponse({
    description: 'The product stock level has been updated.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product stock level updated successfully',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update product stock level',
  })
  async updateStockLevel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductStockLevelDto,
  ) {
    await this.inventoryService.createOrUpdateStockLevel({
      ...dto,
      product_id: id,
    });

    return {
      message: 'Product stock level updated successfully',
    };
  }
}
