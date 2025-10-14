import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from '../products/products.module';
import { ProductSupplier } from './entities/product-supplier.entity';
import { WarehouseStock } from './entities/warehouse-stock.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryListener } from './listeners/inventory.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSupplier, WarehouseStock]),
    ProductsModule,
  ],
  providers: [InventoryService, InventoryListener],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
