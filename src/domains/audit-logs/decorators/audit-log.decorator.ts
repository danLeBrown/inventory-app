import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_META = 'audit_log_meta';

export interface IAuditLogMeta {
  model?: string;
  action?: string;
  has_sensitive_record?: boolean;
  skip_audit?: boolean;
}

export const AuditLog = (meta: IAuditLogMeta) =>
  SetMetadata(AUDIT_LOG_META, meta);
