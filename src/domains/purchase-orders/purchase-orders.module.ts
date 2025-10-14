import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PurchaseOrder } from './entities/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PurchaseOrdersModule {}
