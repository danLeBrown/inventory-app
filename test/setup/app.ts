import { SeedingSource } from '@concepta/typeorm-seeding';
import {
  HttpStatus,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { useContainer } from 'class-validator';
import { randomBytes } from 'crypto';
import { middleware as expressCtx } from 'express-ctx';
import request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';
import { DataSource } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { CreateAdminSeeder } from '../../src/database/seeders';
import { MockS3Service } from '../../src/domains/uploads/providers';
import { setupRedis } from '../helpers';

export async function setupApplication(): Promise<
  [INestApplication, AbstractStartedContainer[]]
> {
  const containers = await Promise.all([
    new PostgreSqlContainer('postgres:16.0-alpine')
      .withExposedPorts(5432)
      .start(),
    new RedisContainer('redis:6.2.19-alpine').start(),
  ]);

  setupRedis(containers[1]);

  const dbConfig = {
    type: 'postgres' as const,
    host: containers[0].getHost(),
    port: containers[0].getMappedPort(5432),
    username: containers[0].getUsername(),
    password: containers[0].getPassword(),
    database: containers[0].getDatabase(),
    entities: [__dirname + '/../../src/domains/**/*.entity.ts'],
    migrations: [__dirname + '/../../src/database/migrations/*.ts'],
    autoLoadEntities: true,
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useFactory({
      factory: async () => {
        const dataSource = new DataSource(dbConfig);
        await dataSource.initialize();
        return dataSource;
      },
    })
    .overrideProvider('IUploadService')
    .useClass(MockS3Service)
    .compile();

  const app = moduleFixture.createNestApplication();
  const dataSource = moduleFixture.get<DataSource>(DataSource);

  app.use(expressCtx);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Run migrations
  await dataSource.runMigrations();

  // Set up seeding
  const seedingSource = new SeedingSource({
    dataSource,
    seeders: [CreateAdminSeeder],
  });

  await seedingSource.initialize();
  await seedingSource.run.all();

  return [await app.init(), containers];
}

export async function getCsrfToken(app: INestApplication) {
  // Get CSRF token
  const sessionId = randomBytes(16).toString('hex'); // Generate a unique session ID for testing
  const res = await request(app.getHttpServer())
    .get('/csrf-token')
    .set('x-session-id', sessionId)
    .expect(200);

  const token = res.body.data.csrf_token;

  if (!token) {
    throw new Error('CSRF token not found in response');
  }

  return {
    token,
    session_id: sessionId,
  };
}

export async function loginAdmin(
  app: INestApplication,
  csrf: { token: string; session_id: string },
) {
  const res = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .set('x-csrf-token', csrf.token)
    .set('x-session-id', csrf.session_id)
    .send({
      email: 'admin@risk-evaluation-app.com',
      password: 'eAzWKnbW00SnPmA',
    })
    .expect(201);

  return res.body.data;
}

export function makeAuthenticatedRequest(
  app: INestApplication,
  csrf: { token: string; session_id: string },
  accessToken: string,
) {
  return {
    get: (url: string) =>
      request(app.getHttpServer())
        .get(url)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id),

    post: (url: string, data: string | object) =>
      request(app.getHttpServer())
        .post(url)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send(data),

    patch: (url: string, data: string | object) =>
      request(app.getHttpServer())
        .patch(url)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send(data),

    delete: (url: string) =>
      request(app.getHttpServer())
        .delete(url)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id),
  };
}
