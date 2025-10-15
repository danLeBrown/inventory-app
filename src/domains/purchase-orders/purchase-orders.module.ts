import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLog } from './entities/purchase-order-log.entity';
import { PurchaseOrderProcessor } from './processors/purchase-order.processor';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderLog]),
    BullModule.registerQueue({
      name: 'purchase-orders',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    ProductsModule,
    InventoryModule,
    WarehousesModule,
    SuppliersModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrderProcessor],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
