import { OmitType } from '@nestjs/swagger';

import { UpdateWarehouseStockDto } from '@/domains/inventory/dto/update-warehouse-stock.dto';

export class UpdateProductStockLevelDto extends OmitType(
  UpdateWarehouseStockDto,
  ['product_id'] as const,
) {}
