export const WAREHOUSE_STOCK_UPDATE_OPERATION = {
  ADD: 'add',
  SUBTRACT: 'subtract',
} as const;

export type WarehouseStockUpdateOperation =
  (typeof WAREHOUSE_STOCK_UPDATE_OPERATION)[keyof typeof WAREHOUSE_STOCK_UPDATE_OPERATION];
