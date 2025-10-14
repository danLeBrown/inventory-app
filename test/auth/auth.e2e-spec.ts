import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { User } from '../../src/domains/users/entities/user.entity';
import { UsersService } from '../../src/domains/users/users.service';
import { getCsrfToken, setupApplication } from '../setup/app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let csrf: { token: string; session_id: string };
  let access_token: string;
  let refresh_token: string;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    csrf = await getCsrfToken(app);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should throw an error when you login with invalid credentials', () => {
    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(400)
        .expect(
          {
            statusCode: 400,
            message: 'Invalid credentials',
            error: 'Bad Request',
          },
          done,
        );
    });

    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: 'admin@clubconnect.com',
          password: faker.internet.password(),
        })
        .expect(400)
        .expect(
          {
            statusCode: 400,
            message: 'Invalid credentials',
            error: 'Bad Request',
          },
          done,
        );
    });
  });

  describe('it should login successfully', () => {
    let newUser: User;

    beforeAll(async () => {
      const usersService = app.get(UsersService);
      newUser = await usersService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: 'TestPassword123',
        is_admin: true,
      });
    });

    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: newUser.email,
          password: 'TestPassword123',
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');

          access_token = res.body.data.access_token;
          refresh_token = res.body.data.refresh_token;

          return done();
        });
    });
  });

  describe('it should get currently logged in user', () => {
    it('GET /v1/auth/user', (done) => {
      request(app.getHttpServer())
        .get('/v1/auth/user')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200, done);
    });
  });

  describe('it should refresh the token', () => {
    it('POST /v1/auth/refresh', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          refresh_token,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');

          return done();
        });
    });

    describe('request new csrf token', () => {
      beforeAll(async () => {
        csrf = await getCsrfToken(app);
      });
      it('POST /v1/auth/refresh', (done) => {
        request(app.getHttpServer())
          .post('/v1/auth/refresh')
          .set('x-csrf-token', csrf.token)
          .set('x-session-id', csrf.session_id)
          .send({
            refresh_token,
          })
          .expect(201)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('access_token');
            expect(res.body.data).toHaveProperty('refresh_token');

            return done();
          });
      });
    });
  });

  describe('it should throw an error if you try to use the refresh_token to access resources', () => {
    it('GET /v1/auth/user', (done) => {
      request(app.getHttpServer())
        .get('/v1/auth/user')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .set('Authorization', `Bearer ${refresh_token}`)
        .expect(401, done);
    });
  });
});
