import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class PurchaseOrders1760408212126 implements MigrationInterface {
  private tableName = 'purchase_orders';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'product_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'supplier_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'warehouse_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'quantity',
      type: 'int',
    }),
    new TableColumn({
      name: 'ordered_at',
      type: 'bigint',
      isNullable: true,
    }),
    new TableColumn({
      name: 'expected_to_arrive_at',
      type: 'bigint',
      isNullable: true,
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '50',
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
      name: 'idx_purchase_orders_product_id',
      columnNames: ['product_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_supplier_id',
      columnNames: ['supplier_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_warehouse_id',
      columnNames: ['warehouse_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_ordered_at',
      columnNames: ['ordered_at'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_expected_to_arrive_at',
      columnNames: ['expected_to_arrive_at'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_purchase_orders_updated_at',
      columnNames: ['updated_at'],
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
