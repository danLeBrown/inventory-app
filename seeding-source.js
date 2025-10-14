/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { SeedingSource } = require('@concepta/typeorm-seeding');
const { CreateAdminSeeder } = require('./dist/database/seeders');

const { DataSource } = require('typeorm');

require('dotenv').config();

module.exports = new SeedingSource({
  dataSource: new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    subscribers: [
      __dirname + '/dist/database/subscribers/*.subscriber{.ts,.js}',
    ],
    entities: [
      __dirname + '/dist/domains/**/*.entity{.ts,.js}',
      __dirname + '/dist/domains/**/*.view-entity{.ts,.js}',
      // for entities like the logs that aren't in a domain
      __dirname + '/dist/configs/**/*.entity{.ts,.js}',
    ],
    dateStrings: true,
  }), // overridden if provided by CLI arg
  seeders: [CreateAdminSeeder],
});
