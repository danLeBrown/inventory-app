import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { ProductSuppliersService } from '@/domains/inventory/product-suppliers.service';
import { ProductsService } from '@/domains/products/products.service';
import { WarehousesService } from '@/domains/warehouses/warehouses.service';

import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { decideQuantityAndWareHouse } from '../helpers/decide-quantity';
import { PurchaseOrdersService } from '../purchase-orders.service';

@Processor('purchase-orders')
export class PurchaseOrderProcessor extends WorkerHost {
  constructor(
    private purchaseOrdersService: PurchaseOrdersService,
    private productsService: ProductsService,
    private productSuppliers: ProductSuppliersService,
    private warehousesService: WarehousesService,
  ) {
    super();
  }

  async process(job: Job<unknown, unknown, string>) {
    switch (job.name) {
      case 'create-purchase-order': {
        await this.handleCreatePurchaseOrder(
          job.data as Pick<CreatePurchaseOrderDto, 'product_id'>,
        );
        break;
      }
    }
  }

  private async handleCreatePurchaseOrder(
    data: Pick<CreatePurchaseOrderDto, 'product_id'>,
  ) {
    const product = await this.productsService.findByIdOrFail(data.product_id);

    const defaultSupplier =
      await this.productSuppliers.findDefaultSupplierForProduct(
        data.product_id,
      );

    if (!defaultSupplier) {
      return;
    }

    const warehouses = await this.warehousesService.findAll();

    const pending_purchase_orders = await this.purchaseOrdersService.findBy({
      product_id: data.product_id,
      status: 'pending',
    });

    const { quantity, warehouse } = decideQuantityAndWareHouse({
      product_reorder_threshold: product.reorder_threshold,
      warehouses,
      pending_purchase_orders,
    });

    if (quantity === 0 || !warehouse) {
      return;
    }

    await this.purchaseOrdersService.create({
      product_id: data.product_id,
      supplier_id: defaultSupplier.supplier_id,
      warehouse_id: warehouse.id,
      quantity_ordered: quantity,
    });
  }
}
