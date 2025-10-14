import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { generateHash } from '../../../helpers/hash.helper';
import { UserDto } from '../dto/user.dto';
import { UserStatus, userStatus } from '../types';
import { UserSession } from './user-session.entity';

@Entity({ name: 'users' })
@SetDto(UserDto)
export class User extends BaseEntity<UserDto> {
  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ type: 'varchar', length: 255, default: userStatus.Active })
  status: UserStatus;

  @BeforeInsert()
  hashPasswordOnInsert() {
    this.password = generateHash(this.password);
  }

  @BeforeUpdate()
  hashPasswordOnUpdate() {
    if (this.password) {
      this.password = generateHash(this.password);
    }
  }

  @OneToMany(() => UserSession, (session) => session.user)
  sessions?: UserSession[];
}
