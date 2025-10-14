import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateUsersTable1748104123752 implements MigrationInterface {
  private tableName = 'users';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'gen_ulid()',
    }),
    new TableColumn({
      name: 'first_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'last_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'email',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'phone_number',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'password',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'is_admin',
      type: 'boolean',
      default: false,
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '255',
      default: `'active'`, // Default status
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
      name: 'idx_users_first_name',
      columnNames: ['first_name'],
    }),
    new TableIndex({
      name: 'idx_users_last_name',
      columnNames: ['last_name'],
    }),
    new TableIndex({
      name: 'idx_users_email',
      columnNames: ['email'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_users_phone_number',
      columnNames: ['phone_number'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_users_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_users_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_users_updated_at',
      columnNames: ['updated_at'],
    }),
    new TableIndex({
      name: 'idx_users_is_admin',
      columnNames: ['is_admin'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        indices: this.indices,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
