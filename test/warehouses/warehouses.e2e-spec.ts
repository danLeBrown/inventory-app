import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { CreateWarehouseDto } from '../../src/domains/warehouses/dto/create-warehouse.dto';
import { WarehousesService } from '../../src/domains/warehouses/warehouses.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('WarehousesController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let warehousesService: WarehousesService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    warehousesService = app.get(WarehousesService);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a warehouse', () => {
    it('POST /v1/warehouses', (done) => {
      const req = {
        name: 'Test Warehouse',
        location: '123 Test St, Test City, TX',
        capacity: 1000,
      } satisfies CreateWarehouseDto;
      request
        .post('/v1/warehouses', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name', req.name);
          expect(res.body.data).toHaveProperty('location', req.location);
          expect(res.body.data).toHaveProperty('capacity', req.capacity);
          expect(res.body.data).toHaveProperty('quantity_in_stock', 0);

          return done();
        });
    });

    it('POST /v1/warehouses (should fail with invalid data)', (done) => {
      const req = {
        name: '', // Invalid name
        description: 'This is another test warehouse',
      };
      request.post('/v1/warehouses', req).expect(422, done);
    });
  });

  describe('it should get all warehouses', () => {
    it('/warehouses (GET)', (done) => {
      request
        .get('/v1/warehouses')
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
          expect(res.body.data[0]).toHaveProperty('location');
          expect(res.body.data[0]).toHaveProperty('capacity');
          expect(res.body.data[0]).toHaveProperty('quantity_in_stock');

          return done();
        });
    });

    it('/warehouses?search_query= (GET)', (done) => {
      request
        .get('/v1/warehouses?search_query=Test')
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

    it('/warehouses?limit= (GET)', (done) => {
      request
        .get('/v1/warehouses?limit=1')
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

  describe('it should get a warehouse by id', () => {
    let warehouseId: string;
    beforeAll(async () => {
      const warehouse = await warehousesService.create({
        name: 'Specific Warehouse',
        location: '123 Specific St, Specific City, TX',
        capacity: 500,
      } satisfies CreateWarehouseDto);
      warehouseId = warehouse.id;
    });

    it('GET /v1/warehouses/:id (should return a warehouse)', (done) => {
      request
        .get(`/v1/warehouses/${warehouseId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id', warehouseId);
          expect(res.body.data).toHaveProperty('name', 'Specific Warehouse');
          expect(res.body.data).toHaveProperty(
            'location',
            '123 Specific St, Specific City, TX',
          );
          expect(res.body.data).toHaveProperty('capacity', 500);
          expect(res.body.data).toHaveProperty('quantity_in_stock', 0);
          return done();
        });
    });
  });

  describe('it should delete a warehouse by id', () => {
    let warehouseId: string;
    beforeAll(async () => {
      const warehouse = await warehousesService.create({
        name: 'Warehouse To Delete',
        location: '456 Delete St, Delete City, TX',
        capacity: 300,
      } satisfies CreateWarehouseDto);
      warehouseId = warehouse.id;
    });

    it('DELETE /v1/warehouses/:id (should delete the warehouse)', (done) => {
      request
        .delete(`/v1/warehouses/${warehouseId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty(
            'message',
            'Warehouse deleted successfully',
          );

          // Verify the warehouse is actually deleted
          request
            .get(`/v1/warehouses/${warehouseId}`)
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

  describe('it should update a warehouse', () => {
    let warehouseId: string;
    beforeAll(async () => {
      const warehouse = await warehousesService.create({
        name: 'Warehouse To Update',
        location: '789 Update St, Update City, TX',
        capacity: 400,
      } satisfies CreateWarehouseDto);
      warehouseId = warehouse.id;
    });

    it('PATCH /v1/warehouses/:id (should update the warehouse)', (done) => {
      const req = {
        name: 'Updated Warehouse Name',
        location: 'Updated location address, Updated City, TX',
      } satisfies Partial<CreateWarehouseDto>;
      request
        .patch(`/v1/warehouses/${warehouseId}`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual('Warehouse updated successfully');

          return done();
        });
    });
    it('PATCH /v1/warehouses/:id (should fail with invalid data)', (done) => {
      const req = {
        quantity_in_stock: -20, // Invalid quantity
        reorder_threshold: 0, // Invalid threshold
      };
      request.patch(`/v1/warehouses/${warehouseId}`, req).expect(422, done);
    });
  });
});
