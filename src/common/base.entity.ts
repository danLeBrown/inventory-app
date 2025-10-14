import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseDto } from './dto/base.dto';

export abstract class BaseEntity<T extends BaseDto> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'bigint',
    default: () => 'FLOOR(EXTRACT(EPOCH FROM NOW()))',
  })
  created_at: number;

  @Column({
    type: 'bigint',
    default: () => 'FLOOR(EXTRACT(EPOCH FROM NOW()))',
  })
  updated_at: number;

  dtoClass: new (entity: BaseEntity<T>, options?: unknown) => T;

  toDto(): T {
    return new this.dtoClass(this);
  }

  @BeforeInsert()
  public beforeInsert(): void {
    this.created_at = Math.floor(Date.now() / 1000);
    this.updated_at = Math.floor(Date.now() / 1000);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.updated_at = Math.floor(Date.now() / 1000);
  }
}
