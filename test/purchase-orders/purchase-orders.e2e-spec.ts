import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { ProductSuppliersService } from '../../src/domains/inventory/product-suppliers.service';
import { Product } from '../../src/domains/products/entities/product.entity';
import { ProductsService } from '../../src/domains/products/products.service';
import { Supplier } from '../../src/domains/suppliers/entities/supplier.entity';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import { WarehousesService } from '../../src/domains/warehouses/warehouses.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('PurchaseOrdersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let productsService: ProductsService;
  let product: Product;
  let supplier: Supplier;
  let productSuppliersService: ProductSuppliersService;
  let suppliersService: SuppliersService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    productsService = app.get(ProductsService);
    productSuppliersService = app.get(ProductSuppliersService);
    suppliersService = app.get(SuppliersService);

    product = await productsService.create({
      name: 'Initial Product',
      description: 'Product for purchase order tests',
      sku: 'INITIALSKU123',
      reorder_threshold: 10,
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should throw an error when creating a purchase order', () => {
    it('POST /v1/purchase-orders (error when product not found)', (done) => {
      request
        .post(`/v1/purchase-orders`, {
          product_id: faker.string.uuid(),
        })
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message', 'Product not found');
          expect(res.body).toHaveProperty('error', 'Not Found');

          return done();
        });
    });

    it('POST /v1/purchase-orders (error when no default supplier)', (done) => {
      request
        .post(`/v1/purchase-orders`, {
          product_id: product.id,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty(
            'message',
            'No default supplier found',
          );
          expect(res.body).toHaveProperty('error', 'Bad Request');

          return done();
        });
    });

    describe('it should throw an error when no warehouse available', () => {
      beforeAll(async () => {
        supplier = await suppliersService.create({
          name: 'Default Supplier',
          contact_information: 'supplier@example.com',
        });

        await productSuppliersService.create({
          product_id: product.id,
          supplier_id: supplier.id,
          is_default: true,
          lead_time_days: 7,
        });
      });

      it('POST /v1/purchase-orders (error when no warehouse available)', (done) => {
        request
          .post(`/v1/purchase-orders`, {
            product_id: product.id,
          })
          .expect(400)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty(
              'message',
              'No warehouse available to receive the purchase order',
            );
            expect(res.body).toHaveProperty('error', 'Bad Request');

            return done();
          });
      });
    });
  });

  describe('it should create a purchase order', () => {
    beforeAll(async () => {
      const warehouseService = app.get(WarehousesService);
      await warehouseService.create({
        name: 'Main Warehouse',
        location: '123 Warehouse St, City, Country',
        capacity: 1000,
      });
    });

    it('POST /v1/purchase-orders', (done) => {
      request
        .post(`/v1/purchase-orders`, {
          product_id: product.id,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('product_id', product.id);
          expect(res.body.data).toHaveProperty('supplier_id', supplier.id);
          expect(res.body.data).toHaveProperty('warehouse_id');
          expect(res.body.data).toHaveProperty('quantity_ordered');
          expect(res.body.data).toHaveProperty('status', 'pending');
          expect(res.body.data).toHaveProperty('created_at');
          expect(res.body.data).toHaveProperty('updated_at');

          return done();
        });
    });
  });

  describe("it should throw an error when there's no quantity to order", () => {
    let newProduct: Product;
    beforeAll(async () => {
      newProduct = await productsService.create({
        name: 'No Order Product',
        description: 'Product that should not trigger a purchase order',
        sku: 'NOORDERSKU123',
        reorder_threshold: 2000, // Setting reorder threshold to 2000 to simulate a maxed out warehouse
      });

      await productSuppliersService.create({
        product_id: newProduct.id,
        supplier_id: supplier.id,
        is_default: true,
        lead_time_days: 5,
      });
    });

    it('POST /v1/purchase-orders (error when not enough capacity)', (done) => {
      request
        .post(`/v1/purchase-orders`, {
          product_id: newProduct.id,
          quantity_ordered: 5000,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty(
            'message',
            'No warehouse available to receive the purchase order',
          );
          expect(res.body).toHaveProperty('error', 'Bad Request');

          return done();
        });
    });
  });

  describe('it should get all purchase orders', () => {
    it('purchase-orders (GET)', (done) => {
      request
        .get('/v1/purchase-orders')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('product_id');
          expect(res.body.data[0]).toHaveProperty('supplier_id');
          expect(res.body.data[0]).toHaveProperty('warehouse_id');
          expect(res.body.data[0]).toHaveProperty('quantity_ordered');
          expect(res.body.data[0]).toHaveProperty('status');
          expect(res.body.data[0]).toHaveProperty('created_at');
          expect(res.body.data[0]).toHaveProperty('updated_at');

          return done();
        });
    });

    it('purchase-orders?status= (GET)', (done) => {
      request
        .get('/v1/purchase-orders?status=pending')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);

          return done();
        });
    });

    it('purchase-orders?limit= (GET)', (done) => {
      request
        .get('/v1/purchase-orders?limit=1')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(1);

          return done();
        });
    });
  });
});
