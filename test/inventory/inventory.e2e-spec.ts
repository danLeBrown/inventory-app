import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UpdateProductStockLevelDto } from '../../src/domains/inventory/dto/update-product-stock-level.dto';
import { ProductSuppliersService } from '../../src/domains/inventory/product-suppliers.service';
import { Product } from '../../src/domains/products/entities/product.entity';
import { ProductsService } from '../../src/domains/products/products.service';
import { PurchaseOrdersService } from '../../src/domains/purchase-orders/purchase-orders.service';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import { Warehouse } from '../../src/domains/warehouses/entities/warehouse.entity';
import { WarehousesService } from '../../src/domains/warehouses/warehouses.service';
import { tryAssert } from '../helpers';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let productsService: ProductsService;
  //   let inventoryService: InventoryService;
  let warehousesService: WarehousesService;
  let product: Product;
  let warehouse: Warehouse;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    productsService = app.get(ProductsService);
    warehousesService = app.get(WarehousesService);

    product = await productsService.create({
      name: 'Test Product',
      description: 'This is a test product',
      sku: 'TESTSKU123',
      // quantity_in_stock: 100,
      reorder_threshold: 10,
    });

    expect(product.quantity_in_stock).toBe(0);

    warehouse = await warehousesService.create({
      name: 'Main Warehouse',
      location: '123 Warehouse St, City, Country',
      capacity: 1000,
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should add stock', () => {
    afterAll(async () => {
      await tryAssert(async () => {
        const updatedProduct = await productsService.findByIdOrFail(product.id);

        expect(updatedProduct.quantity_in_stock).toBe(200);
      });
    });

    it('POST /v1/inventory/product/:id/stocks', (done) => {
      const req = {
        warehouse_id: warehouse.id,
        quantity: 200,
        operation: 'add',
      } satisfies UpdateProductStockLevelDto;

      request
        .patch(`/v1/inventory/products/${product.id}/stocks`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual(
            'Product stock level updated successfully',
          );

          return done();
        });
    });
  });

  describe('it should reduce stock', () => {
    afterAll(async () => {
      await tryAssert(async () => {
        const updatedProduct = await productsService.findByIdOrFail(product.id);

        expect(updatedProduct.quantity_in_stock).toBe(50);
      });
    });

    it('POST /v1/inventory/products/:id/stocks', (done) => {
      const req = {
        warehouse_id: warehouse.id,
        quantity: 150,
        operation: 'subtract',
      } satisfies UpdateProductStockLevelDto;

      request
        .patch(`/v1/inventory/products/${product.id}/stocks`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual(
            'Product stock level updated successfully',
          );

          return done();
        });
    });
  });

  describe('it should automatically trigger a purchase order if quantity falls below threshold', () => {
    beforeAll(async () => {
      const suppliersService = app.get(SuppliersService);
      const supplier = await suppliersService.create({
        name: 'Default Supplier',
        contact_information: 'supplier@example.com',
      });

      const productSuppliersService = app.get(ProductSuppliersService);

      await productSuppliersService.create({
        product_id: product.id,
        supplier_id: supplier.id,
        is_default: true,
        lead_time_days: 7,
      });
    });
    afterAll(async () => {
      await tryAssert(async () => {
        const updatedProduct = await productsService.findByIdOrFail(product.id);

        expect(updatedProduct.quantity_in_stock).toBe(2);

        const purchaseOrdersService = app.get(PurchaseOrdersService);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const purchaseOrders = await purchaseOrdersService.findBy();

        expect(purchaseOrders).toHaveLength(1);
      });
    });

    it('POST /v1/inventory/products/:id/stocks', (done) => {
      const req = {
        warehouse_id: warehouse.id,
        quantity: 48,
        operation: 'subtract',
      } satisfies UpdateProductStockLevelDto;

      request
        .patch(`/v1/inventory/products/${product.id}/stocks`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual(
            'Product stock level updated successfully',
          );

          return done();
        });
    });
  });
});
