import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { User } from '@/domains/users/entities/user.entity';

import { BaseEntity } from '../../../common/base.entity';
import { SetDto } from '../../../decorators/set-dto.decorator';
import { AuditLogDto } from '../dto/audit-log.dto';
import { AuditLogStatus } from '../types';

@Entity({ name: 'audit_logs' })
@SetDto(AuditLogDto)
export class AuditLog extends BaseEntity<AuditLogDto> {
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  method: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'jsonb', nullable: true })
  request_body: string | null;

  @Column({ type: 'varchar', length: 255 })
  model: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'inet' })
  ip_address: string;

  @Column({ type: 'varchar', length: 255 })
  user_agent: string | null;

  @Column({ type: 'jsonb' })
  meta: string;

  @Column({ type: 'varchar', length: 255 })
  status: AuditLogStatus;

  @Column({ type: 'int' })
  status_code: number;

  @Column({ type: 'int' })
  duration_ms: number;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
