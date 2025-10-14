import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import {
  CreateUserDto,
  UpdateUserDto,
} from '../../src/domains/users/dto/create-user.dto';
import { UserDto } from '../../src/domains/users/dto/user.dto';
import { UsersService } from '../../src/domains/users/users.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let usersService: UsersService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    usersService = app.get(UsersService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a user', () => {
    const password = faker.internet.password();

    afterAll(async () => {
      const [existingUsers] = await usersService.searchAndFindBy({});

      expect(existingUsers).toHaveLength(3);
      expect(
        existingUsers.some((user) => user.password === password),
      ).toBeFalsy();
    });

    const req = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone_number: faker.phone.number(),
      email: 'john@example.com',
      password,
      is_admin: false,
    } satisfies CreateUserDto;

    it('POST /v1/users', (done) => {
      request
        .post('/v1/users', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data.first_name).toBe(req.first_name);
          expect(res.body.data.last_name).toBe(req.last_name);
          expect(res.body.data.email).toBe(req.email.toLowerCase().trim());
          expect(res.body.data.phone_number).toBe(req.phone_number);
          expect(res.body.data.is_admin).toBe(req.is_admin);

          return done();
        });
    });

    it('POST /v1/users with existing email', (done) => {
      request.post('/v1/users', req).expect(400, done);
    });
  });

  describe('it should get all users', () => {
    it('/v1/users (GET)', (done) => {
      request
        .get('/v1/users')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(3); // admins + created user

          return done();
        });
    });

    it('/v1/users/admins (GET)', (done) => {
      request
        .get('/v1/users/admins')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toEqual(2); // the admins

          return done();
        });
    });

    it('/?search_query= (GET)', (done) => {
      request
        .get('/v1/users?search_query=john')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].email).toEqual('john@example.com');

          return done();
        });
    });
  });

  describe('it should get a user by id', () => {
    it('/v1/users/:id (GET)', (done) => {
      request
        .get(`/v1/users/${admin.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(admin.id);
          expect(res.body.data.first_name).toBe(admin.first_name);
          expect(res.body.data.last_name).toBe(admin.last_name);
          expect(res.body.data.email).toBe(admin.email);
          expect(res.body.data.phone_number).toBe(admin.phone_number);
          expect(res.body.data.is_admin).toBe(admin.is_admin);

          return done();
        });
    });
  });

  describe('it should update a user', () => {
    const req = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone_number: faker.phone.number(),
      email: faker.internet.email(),
    } satisfies UpdateUserDto;

    afterAll(async () => {
      const updatedUser = await usersService.findOneBy({
        id: admin.id,
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.first_name).toBe(req.first_name);
      expect(updatedUser?.last_name).toBe(req.last_name);
      expect(updatedUser?.phone_number).toBe(req.phone_number);
      expect(updatedUser?.email).toBe(req.email.toLowerCase().trim());
    });

    it('/v1/users/:id (PATCH)', (done) => {
      request
        .patch(`/v1/users/${admin.id}`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message');

          return done();
        });
    });
  });
});
