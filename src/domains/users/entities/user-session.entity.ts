import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { UserSessionDto } from '../dto/user-session.dto';
import { User } from './user.entity';

@Entity('user_sessions')
@SetDto(UserSessionDto)
export class UserSession extends BaseEntity<UserSessionDto> {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  refresh_token: string;

  @Column({ type: 'int' })
  expired_at: number;

  @Column({ type: 'int' })
  login_at: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip_address: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
