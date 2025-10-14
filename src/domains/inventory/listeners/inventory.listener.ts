import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductsService } from '@/domains/products/products.service';

import { UpdateWarehouseStockDto } from '../dto/update-warehouse-stock.dto';
import { InventoryService } from '../inventory.service';

@Injectable()
export class InventoryListener {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductsService,
  ) {}

  @OnEvent('inventory.stock.updated', {
    async: true,
    promisify: true,
  })
  async handleInventoryUpdatedEvent(payload: UpdateWarehouseStockDto) {
    const sum = await this.inventoryService.findProductStockLevel({
      product_id: payload.product_id,
    });

    await this.productService.updateQuantityInStock(payload.product_id, sum);
  }
}
