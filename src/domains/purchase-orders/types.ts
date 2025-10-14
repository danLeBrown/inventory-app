export const PURCHASE_ORDER_STATUS = {
  PENDING: 'pending',
  //   APPROVED: 'approved',
  //   REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type PurchaseOrderStatus =
  (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS];

export const PURCHASE_ORDER_LOG_GROUPS = {
  STATUS: 'status',
} as const;

export type PurchaseOrderLogGroup =
  (typeof PURCHASE_ORDER_LOG_GROUPS)[keyof typeof PURCHASE_ORDER_LOG_GROUPS];

export const PURCHASE_ORDER_LOG_TAGS = {
  COMPLETED_AT: 'completed_at',
  CANCELLED_AT: 'cancelled_at',
} as const;

export type PurchaseOrderLogTag =
  (typeof PURCHASE_ORDER_LOG_TAGS)[keyof typeof PURCHASE_ORDER_LOG_TAGS];
