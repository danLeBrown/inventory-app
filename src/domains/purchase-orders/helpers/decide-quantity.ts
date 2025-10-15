import { Warehouse } from '@/domains/warehouses/entities/warehouse.entity';

import { PurchaseOrder } from '../entities/purchase-order.entity';

export function decideQuantityAndWareHouse(data: {
  product_reorder_threshold: number;
  warehouses: Warehouse[];
  pending_purchase_orders: PurchaseOrder[];
  quantity_ordered?: number;
}): { quantity: number; warehouse: Warehouse | null } {
  const sortedWarehouses = data.warehouses.sort(
    (a, b) => b.capacity - a.capacity,
  );

  const ideal_quantity_needed = data.product_reorder_threshold * 2;

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

    const calculated_quantity_based_on_availability =
      ideal_quantity_needed - (current_stock + pending_quantity);

    if (data.quantity_ordered !== undefined) {
      if (available_space >= data.quantity_ordered) {
        return {
          quantity: data.quantity_ordered,
          warehouse,
        };
      }
    }

    if (available_space >= calculated_quantity_based_on_availability) {
      return {
        quantity: Math.min(
          available_space,
          calculated_quantity_based_on_availability,
        ),
        warehouse,
      };
    }
  }

  // If all warehouses are full or no reorder needed, return 0
  return { quantity: 0, warehouse: null };
}
