export const auditLogStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export type AuditLogStatus =
  (typeof auditLogStatus)[keyof typeof auditLogStatus];
