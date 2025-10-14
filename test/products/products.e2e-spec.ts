import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { CreateProductDto } from '../../src/domains/products/dto/create-product.dto';
import { ProductsService } from '../../src/domains/products/products.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let productsService: ProductsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    productsService = app.get(ProductsService);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a product', () => {
    it('POST /v1/products', (done) => {
      const req = {
        name: 'Test Product',
        description: 'This is a test product',
        sku: 'TESTSKU123',
        // quantity_in_stock: 100,
        reorder_threshold: 10,
      } satisfies CreateProductDto;
      request
        .post('/v1/products', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name', req.name);
          expect(res.body.data).toHaveProperty('description', req.description);
          expect(res.body.data).toHaveProperty('sku', req.sku);
          // expect(res.body.data).toHaveProperty(
          //   'quantity_in_stock',
          //   req.quantity_in_stock,
          // );
          expect(res.body.data).toHaveProperty(
            'reorder_threshold',
            req.reorder_threshold,
          );

          return done();
        });
    });

    it('POST /v1/products (should fail with duplicate SKU)', (done) => {
      const req = {
        name: 'Test Product 2',
        description: 'This is another test product',
        sku: 'TESTSKU123', // Duplicate SKU
        // quantity_in_stock: 50,
        reorder_threshold: 5,
      } satisfies CreateProductDto;
      request
        .post('/v1/products', req)
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty(
            'message',
            'Product with this SKU already exists',
          );
          expect(res.body).toHaveProperty('error', 'Bad Request');

          return done();
        });
    });

    it('POST /v1/products (should fail with invalid data)', (done) => {
      const req = {
        name: '', // Invalid name
        description: 'This is another test product',
        sku: 'TESTSKU124',
        // quantity_in_stock: -10, // Invalid quantity
        reorder_threshold: 0, // Invalid threshold
      };
      request.post('/v1/products', req).expect(422, done);
    });
  });

  describe('it should get all products', () => {
    it('/products (GET)', (done) => {
      request
        .get('/v1/products')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('name');
          expect(res.body.data[0]).toHaveProperty('description');
          expect(res.body.data[0]).toHaveProperty('sku');
          expect(res.body.data[0]).toHaveProperty('quantity_in_stock');
          expect(res.body.data[0]).toHaveProperty('reorder_threshold');

          return done();
        });
    });

    it('/products?search_query= (GET)', (done) => {
      request
        .get('/v1/products?search_query=Test')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].name).toContain('Test');

          return done();
        });
    });

    it('/products?limit= (GET)', (done) => {
      request
        .get('/v1/products?limit=1')
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

  describe('it should get a product by id', () => {
    let productId: string;
    beforeAll(async () => {
      const product = await productsService.create({
        name: 'Specific Product',
        description: 'Product to fetch by ID',
        sku: 'SPECIFICSKU123',
        // quantity_in_stock: 20,
        reorder_threshold: 2,
      } satisfies CreateProductDto);
      productId = product.id;
    });

    it('GET /v1/products/:id (should return a product)', (done) => {
      request
        .get(`/v1/products/${productId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id', productId);
          expect(res.body.data).toHaveProperty('name', 'Specific Product');
          expect(res.body.data).toHaveProperty(
            'description',
            'Product to fetch by ID',
          );
          expect(res.body.data).toHaveProperty('sku', 'SPECIFICSKU123');
          expect(res.body.data).toHaveProperty('quantity_in_stock', 0);
          expect(res.body.data).toHaveProperty('reorder_threshold', 2);

          return done();
        });
    });
  });

  describe('it should delete a product by id', () => {
    let productId: string;
    beforeAll(async () => {
      const product = await productsService.create({
        name: 'Product To Delete',
        description: 'Product that will be deleted',
        sku: 'DELETESKU123',
        // quantity_in_stock: 15,
        reorder_threshold: 3,
      } satisfies CreateProductDto);
      productId = product.id;
    });

    it('DELETE /v1/products/:id (should delete the product)', (done) => {
      request
        .delete(`/v1/products/${productId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty(
            'message',
            'Product deleted successfully',
          );

          // Verify the product is actually deleted
          request
            .get(`/v1/products/${productId}`)
            .expect(404)
            .end((err2) => {
              if (err2) {
                return done(err2);
              }
              return done();
            });
        });
    });
  });

  describe('it should update a product', () => {
    let productId: string;
    beforeAll(async () => {
      const product = await productsService.create({
        name: 'Product To Update',
        description: 'Product that will be updated',
        sku: 'UPDATESKU123',
        // quantity_in_stock: 30,
        reorder_threshold: 5,
      } satisfies CreateProductDto);
      productId = product.id;
    });

    it('PATCH /v1/products/:id (should update the product)', (done) => {
      const req = {
        name: 'Updated Product Name',
        description: 'Updated product description',
        // quantity_in_stock: 50,
        reorder_threshold: 8,
      } satisfies Partial<CreateProductDto>;
      request
        .patch(`/v1/products/${productId}`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual('Product updated successfully');

          return done();
        });
    });

    it('PATCH /v1/products/:id (should fail with duplicate SKU)', (done) => {
      const req = {
        sku: 'TESTSKU123', // SKU that already exists
      } satisfies Partial<CreateProductDto>;
      request
        .patch(`/v1/products/${productId}`, req)
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty(
            'message',
            'Product with this SKU already exists',
          );
          expect(res.body).toHaveProperty('error', 'Bad Request');

          return done();
        });
    });

    it('PATCH /v1/products/:id (should fail with invalid data)', (done) => {
      const req = {
        quantity_in_stock: -20, // Invalid quantity
        reorder_threshold: 0, // Invalid threshold
      };
      request.patch(`/v1/products/${productId}`, req).expect(422, done);
    });
  });
});
