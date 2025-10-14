import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderProcessor } from './processors/purchase-order.processor';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder]),
    BullModule.registerQueue({
      name: 'purchase-orders',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrderProcessor],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
