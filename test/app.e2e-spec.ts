import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { setupApplication } from './setup/app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];

  beforeAll(async () => {
    [app, containers] = await setupApplication();
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', () =>
    request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));
});
