import 'reflect-metadata';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { SnakeNamingStrategy } from './setup/typeorm/snake-naming-strategy';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
  entities: [__dirname + '/domains/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/database/subscribers/*.subscriber{.ts,.js}'],
  ssl:
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
