import { Warehouse } from '@/domains/warehouses/entities/warehouse.entity';

import { PurchaseOrder } from '../entities/purchase-order.entity';

export function decideQuantityAndWareHouse(data: {
  product_reorder_threshold: number;
  warehouses: Warehouse[];
  pending_purchase_orders: PurchaseOrder[];
}): { quantity: number; warehouse: Warehouse | null } {
  const sortedWarehouses = data.warehouses.sort(
    (a, b) => b.capacity - a.capacity,
  );

  for (const warehouse of sortedWarehouses) {
    const current_stock = warehouse.quantity_in_stock;
    const pending_quantity = data.pending_purchase_orders
      .filter(
        (po) => po.warehouse_id === warehouse.id && po.status === 'pending',
      )
      .reduce((sum, po) => sum + po.quantity_ordered, 0);
    const available_space =
      warehouse.capacity - (current_stock + pending_quantity);

    if (available_space <= 0) {
      continue; // No space available in this warehouse
    }

    if (current_stock + pending_quantity < data.product_reorder_threshold) {
      const quantity_needed =
        data.product_reorder_threshold * 2 - (current_stock + pending_quantity);
      return {
        quantity: Math.min(quantity_needed, available_space),
        warehouse,
      };
    }
  }

  // If all warehouses are full or no reorder needed, return 0
  return { quantity: 0, warehouse: null };
}
