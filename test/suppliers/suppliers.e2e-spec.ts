import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { CreateSupplierDto } from '../../src/domains/suppliers/dto/create-supplier.dto';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('SuppliersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let suppliersService: SuppliersService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    suppliersService = app.get(SuppliersService);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a supplier', () => {
    it('POST /v1/suppliers', (done) => {
      const req = {
        name: 'Test Supplier',
        contact_information: 'This is a test supplier',
      } satisfies CreateSupplierDto;
      request
        .post('/v1/suppliers', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name', req.name);
          expect(res.body.data).toHaveProperty(
            'contact_information',
            req.contact_information,
          );

          return done();
        });
    });

    it('POST /v1/suppliers (should fail with invalid data)', (done) => {
      const req = {
        name: '', // Invalid name
        description: 'This is another test supplier',
      };
      request.post('/v1/suppliers', req).expect(422, done);
    });
  });

  describe('it should get all suppliers', () => {
    it('/suppliers (GET)', (done) => {
      request
        .get('/v1/suppliers')
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
          expect(res.body.data[0]).toHaveProperty('contact_information');

          return done();
        });
    });

    it('/suppliers?search_query= (GET)', (done) => {
      request
        .get('/v1/suppliers?search_query=Test')
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

    it('/suppliers?limit= (GET)', (done) => {
      request
        .get('/v1/suppliers?limit=1')
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

  describe('it should get a supplier by id', () => {
    let supplierId: string;
    beforeAll(async () => {
      const supplier = await suppliersService.create({
        name: 'Specific Supplier',
        contact_information: 'Supplier to fetch by ID',
      } satisfies CreateSupplierDto);
      supplierId = supplier.id;
    });

    it('GET /v1/suppliers/:id (should return a supplier)', (done) => {
      request
        .get(`/v1/suppliers/${supplierId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id', supplierId);
          expect(res.body.data).toHaveProperty('name', 'Specific Supplier');
          expect(res.body.data).toHaveProperty(
            'contact_information',
            'Supplier to fetch by ID',
          );
          return done();
        });
    });
  });

  describe('it should delete a supplier by id', () => {
    let supplierId: string;
    beforeAll(async () => {
      const supplier = await suppliersService.create({
        name: 'Supplier To Delete',
        contact_information: 'Supplier contact information',
      } satisfies CreateSupplierDto);
      supplierId = supplier.id;
    });

    it('DELETE /v1/suppliers/:id (should delete the supplier)', (done) => {
      request
        .delete(`/v1/suppliers/${supplierId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty(
            'message',
            'Supplier deleted successfully',
          );

          // Verify the supplier is actually deleted
          request
            .get(`/v1/suppliers/${supplierId}`)
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

  describe('it should update a supplier', () => {
    let supplierId: string;
    beforeAll(async () => {
      const supplier = await suppliersService.create({
        name: 'Supplier To Update',
        contact_information: 'Initial contact information',
      } satisfies CreateSupplierDto);
      supplierId = supplier.id;
    });

    it('PATCH /v1/suppliers/:id (should update the supplier)', (done) => {
      const req = {
        name: 'Updated Supplier Name',
        contact_information: 'Updated contact information',
      } satisfies Partial<CreateSupplierDto>;
      request
        .patch(`/v1/suppliers/${supplierId}`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();
          expect(res.body.message).toEqual('Supplier updated successfully');

          return done();
        });
    });
    it('PATCH /v1/suppliers/:id (should fail with invalid data)', (done) => {
      const req = {
        quantity_in_stock: -20, // Invalid quantity
        reorder_threshold: 0, // Invalid threshold
      };
      request.patch(`/v1/suppliers/${supplierId}`, req).expect(422, done);
    });
  });
});
