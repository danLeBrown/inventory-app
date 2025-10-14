import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserSessionsTable1748106108956
  implements MigrationInterface
{
  private tableName = 'user_sessions';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'user_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'refresh_token',
      type: 'text',
    }),
    new TableColumn({
      name: 'login_at',
      type: 'int',
      isNullable: true,
    }),
    new TableColumn({
      name: 'ip_address',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'user_agent',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'expired_at',
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

  private indices = [
    new TableIndex({
      name: 'idx_user_sessions_user_id',
      columnNames: ['user_id'],
    }),
    new TableIndex({
      name: 'idx_user_sessions_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_user_sessions_updated_at',
      columnNames: ['updated_at'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_user_sessions_user_id',
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        indices: this.indices,
        foreignKeys: this.foreignKeys,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
