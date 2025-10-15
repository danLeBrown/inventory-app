import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePurchaseOrderLogs1760541844685
  implements MigrationInterface
{
  private tableName = 'purchase_order_logs';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'purchase_order_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'tag',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'value',
      type: 'text',
    }),
    new TableColumn({
      name: 'created_at',
      type: 'bigint',
    }),
    new TableColumn({
      name: 'updated_at',
      type: 'bigint',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_purchase_order_logs_purchase_order_id',
      columnNames: ['purchase_order_id'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      columnNames: ['purchase_order_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'purchase_orders',
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
