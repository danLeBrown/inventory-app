import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { AppConfigService } from '@/app-configs/app-config.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

import {
  CreateAuditLogDto,
  QueryAuditLogDto,
} from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
    private configService: AppConfigService,
  ) {}

  async create(dto: CreateAuditLogDto) {
    if (this.configService.isAuditLogsDisabled()) {
      return;
    }

    return this.repo.save(this.repo.create(dto));
  }

  async findBy(query: QueryAuditLogDto & PaginationDto) {
    const { from_time, to_time, user_id, limit = 0, page = 0, ...rest } = query;

    const q: FindOptionsWhere<AuditLog> = rest;

    if (user_id) {
      q.user_id = user_id;
    }

    if (from_time && to_time) {
      q.created_at = Between(
        getUnixTime(new Date(from_time * 1000)),
        getUnixTime(new Date(to_time * 1000)),
      );
    }

    if (from_time && !to_time) {
      q.created_at = MoreThanOrEqual(getUnixTime(new Date(from_time * 1000)));
    }

    if (!from_time && to_time) {
      q.created_at = LessThanOrEqual(getUnixTime(new Date(to_time * 1000)));
    }

    return this.repo.findAndCount({
      where: q,
      order: {
        created_at: 'DESC',
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async findOneByOrFail(q: FindOptionsWhere<AuditLog>) {
    const auditLog = await this.repo.findOne({
      where: q,
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log not found`);
    }

    return auditLog;
  }
}
