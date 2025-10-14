import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

import { AuditLogsService } from './audit-logs.service';
import { AuditLogDto } from './dto/audit-log.dto';
import { QueryAuditLogDto } from './dto/create-audit-log.dto';

@Controller({
  path: 'audit-logs',
  version: '1',
})
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @ApiOkResponse({
    description: 'Returns a list of audit logs',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(AuditLogDto) },
            },
          },
        },
      ],
    },
  })
  @Get()
  async findBy(@Query() query: QueryAuditLogDto & PaginationDto) {
    const [data, total] = await this.auditLogsService.findBy(query);

    return new PaginatedDto(AuditLogDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Returns a single audit log by ID',
    type: AuditLogDto,
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLogDto> {
    const auditLog = await this.auditLogsService.findOneByOrFail({ id });
    return new AuditLogDto(auditLog);
  }
}
