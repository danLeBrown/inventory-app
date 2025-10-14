import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

process.env.AUDIT_LOGS_ENABLED = 'true';
describe('AuditLogsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any async operations to complete
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should fetch the users so an audit log is recorded', () => {
    it('/users (GET)', (done) => {
      request.get('/v1/users').expect(200, done);
    });
  });

  describe('it should get all audit logs', () => {
    it('/audit-logs (GET)', (done) => {
      request
        .get('/v1/audit-logs')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(3);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('user_id');
          expect(res.body.data[0]).toHaveProperty('method');
          expect(res.body.data[0]).toHaveProperty('path');
          expect(res.body.data[0]).toHaveProperty('request_body');
          expect(res.body.data[0]).toHaveProperty('model');
          expect(res.body.data[0]).toHaveProperty('action');
          expect(res.body.data[0]).toHaveProperty('ip_address');
          expect(res.body.data[0]).toHaveProperty('user_agent');
          expect(res.body.data[0]).toHaveProperty('meta');
          expect(res.body.data[0]).toHaveProperty('status');
          expect(res.body.data[0]).toHaveProperty('status_code');
          expect(res.body.data[0]).toHaveProperty('duration_ms');
          expect(res.body.data[0]).toHaveProperty('created_at');
          expect(res.body.data[0]).toHaveProperty('updated_at');
          // expect(res.body.data[0]).toHaveProperty('user');

          return done();
        });
    });
  });
});
