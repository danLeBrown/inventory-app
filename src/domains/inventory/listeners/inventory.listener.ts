import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductsService } from '@/domains/products/products.service';
import { WarehousesService } from '@/domains/warehouses/warehouses.service';

import { CreateProductSupplierDto } from '../dto/create-product-supplier.dto';
import { UpdateWarehouseStockDto } from '../dto/update-warehouse-stock.dto';
import { InventoryService } from '../inventory.service';
import { ProductSuppliersService } from '../product-suppliers.service';

@Injectable()
export class InventoryListener {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductsService,
    private readonly warehouseService: WarehousesService,
    private readonly productSuppliersService: ProductSuppliersService,
  ) {}

  @OnEvent('inventory.stock.updated', {
    async: true,
    promisify: true,
  })
  async updateProductQuantityInStock(payload: UpdateWarehouseStockDto) {
    const sum = await this.inventoryService.findProductStockLevel({
      product_id: payload.product_id,
    });

    const product = await this.productService.findByIdOrFail(
      payload.product_id,
    );

    if (sum <= product.reorder_threshold) {
      await this.productService.createPurchaseOrder(product.id);
    }

    await this.productService.updateQuantityInStock(payload.product_id, sum);
  }

  @OnEvent('inventory.stock.updated', {
    async: true,
    promisify: true,
  })
  async updateWarehouseQuantityInStock(payload: UpdateWarehouseStockDto) {
    const sum = await this.inventoryService.findWarehouseStockLevel({
      warehouse_id: payload.warehouse_id,
    });

    await this.warehouseService.updateQuantityInStock(
      payload.warehouse_id,
      sum,
    );
  }

  @OnEvent('product.supplier.created', {
    async: true,
    promisify: true,
  })
  async handleProductSupplierCreatedEvent(payload: CreateProductSupplierDto) {
    if (payload.is_default) {
      await this.productSuppliersService.updateAsDefault(payload);
    }
  }
}
