import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { InventoryService } from '@/domains/inventory/inventory.service';

import { PurchaseOrder } from '../entities/purchase-order.entity';

@Injectable()
export class PurchaseOrderListener {
  constructor(
    private readonly inventoryService: InventoryService, // Assume InventoryService is imported
  ) {}

  @OnEvent('purchase-order.completed', { async: true, promisify: true })
  async handlePurchaseOrderReceivedEvent(payload: PurchaseOrder) {
    await this.inventoryService.createOrUpdateStockLevel({
      product_id: payload.product_id,
      warehouse_id: payload.warehouse_id,
      quantity: payload.quantity_ordered,
      operation: 'add',
    });
  }
}
