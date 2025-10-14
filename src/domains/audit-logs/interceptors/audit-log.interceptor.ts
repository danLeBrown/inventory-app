import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getClientIp } from '@supercharge/request-ip';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { AppConfigService } from '@/app-configs/app-config.service';
import { AuthUserDto } from '@/domains/authentication/dto/auth-user.dto';

import {
  AUDIT_LOG_META,
  IAuditLogMeta,
} from '../decorators/audit-log.decorator';
import { AuditLog } from '../entities/audit-log.entity';

const sensitiveRecordProperties = [
  'password',
  'password_confirmation',
  'old_password',
  'new_password',
  'confirm_password',
  'current_password',
] as const;

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  logger = new Logger(AuditLogInterceptor.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    private appConfigService: AppConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.appConfigService.isAuditLogsDisabled()) {
      return next.handle();
    }

    const startTime = Date.now();

    const request = context.switchToHttp().getRequest();

    const authUser = request.user as AuthUserDto | undefined;

    const controllerClass = context.getClass();
    const controllerName = controllerClass.name;
    const controllerAuditMeta: IAuditLogMeta | undefined = Reflect.getMetadata(
      AUDIT_LOG_META,
      controllerClass,
    );

    const controllerMethod = context.getHandler();
    const controllerMethodName = controllerMethod.name;
    const controllerMethodMetadata: string | string[] = Reflect.getMetadata(
      'path',
      controllerMethod,
    );
    const methodAuditMeta: IAuditLogMeta | undefined = Reflect.getMetadata(
      AUDIT_LOG_META,
      controllerMethod,
    );

    let can_skip_audit = Boolean(controllerAuditMeta?.skip_audit);
    let has_sensitive_record = Boolean(
      controllerAuditMeta?.has_sensitive_record,
    );
    let model: string = controllerAuditMeta?.model || controllerClass.name;
    let action: string =
      controllerAuditMeta?.action || controllerMethodMetadata.toString();

    if (methodAuditMeta?.has_sensitive_record !== undefined) {
      has_sensitive_record = methodAuditMeta.has_sensitive_record;
    }

    if (methodAuditMeta?.model) {
      model = methodAuditMeta.model;
    }

    if (methodAuditMeta?.action) {
      action = methodAuditMeta.action;
    }

    if (methodAuditMeta?.skip_audit !== undefined) {
      can_skip_audit = methodAuditMeta.skip_audit;
    }

    // skip audit logging
    if (can_skip_audit) {
      return next.handle();
    }

    const httpBody = { ...request.body };
    if (has_sensitive_record) {
      // Remove sensitive properties from the request body
      sensitiveRecordProperties.forEach((property) => {
        if (httpBody && property in httpBody) {
          httpBody[property] = '***';
        }
      });
    }

    // Save the data to the AuditLog entity
    // const auditLogRepository = getRepositoryToken(AuditLog);
    const auditLog = this.auditLogRepo.create({
      user_id: authUser?.user.id || null,
      method: request.method,
      path: request.path,
      request_body: httpBody ? JSON.stringify(httpBody) : null,
      model,
      action,
      ip_address: getClientIp(request),
      user_agent: request.headers['user-agent'],
      meta: JSON.stringify({
        controller: controllerName,
        controller_method: controllerMethodName,
        has_sensitive_record,
      }),
    });

    return next.handle().pipe(
      tap(() => {
        context
          .switchToHttp()
          .getResponse()
          .on('finish', async () => {
            const status_code = context.switchToHttp().getResponse().statusCode;
            // Save the audit log entry to the database
            await this.auditLogRepo
              .save({
                ...auditLog,
                status: String(status_code).startsWith('20')
                  ? 'success'
                  : 'failure',
                duration_ms: Date.now() - startTime,
                status_code,
              })
              .catch((error) => {
                this.logger.error('Error saving audit log:', error);
              });
          });
      }),
    );
  }
}
