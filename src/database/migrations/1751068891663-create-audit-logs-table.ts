import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAuditLogsTable1751068891663 implements MigrationInterface {
  private tableName = 'audit_logs';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'gen_ulid()',
    }),
    new TableColumn({
      name: 'user_id',
      type: 'uuid',
      isNullable: true,
    }),
    new TableColumn({
      name: 'method',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'path',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'request_body',
      type: 'jsonb',
      isNullable: true,
    }),
    new TableColumn({
      name: 'model',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'action',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'ip_address',
      type: 'inet',
    }),
    new TableColumn({
      name: 'user_agent',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'meta',
      type: 'jsonb',
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'status_code',
      type: 'int',
    }),
    new TableColumn({
      name: 'duration_ms',
      type: 'int',
    }),
    new TableColumn({
      name: 'created_at',
      type: 'bigint',
      default: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
    }),
    new TableColumn({
      name: 'updated_at',
      type: 'bigint',
      default: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
      onUpdate: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_audit_logs_user_id',
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'SET NULL',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_audit_logs_user_id',
      columnNames: ['user_id'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_method',
      columnNames: ['method'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_path',
      columnNames: ['path'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_model',
      columnNames: ['model'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_action',
      columnNames: ['action'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_audit_logs_updated_at',
      columnNames: ['updated_at'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        foreignKeys: this.foreignKeys,
        indices: this.indices,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
