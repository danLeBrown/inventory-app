import { OmitType, PartialType } from '@nestjs/swagger';

import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto extends PartialType(
  OmitType(CreatePurchaseOrderDto, [
    'product_id',
    'warehouse_id',
    'supplier_id',
  ] as const),
) {}
