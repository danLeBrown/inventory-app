import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateWarehouseStocks1760465686787 implements MigrationInterface {
  private tableName = 'warehouse_stocks';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'warehouse_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'product_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'quantity',
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
      name: 'idx_warehouse_stocks_product_id',
      columnNames: ['product_id'],
    }),
    new TableIndex({
      name: 'idx_warehouse_stocks_warehouse_id',
      columnNames: ['warehouse_id'],
    }),
    new TableIndex({
      name: 'idx_product_suppliers_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_product_suppliers_updated_at',
      columnNames: ['updated_at'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'CASCADE',
    }),
    new TableForeignKey({
      columnNames: ['warehouse_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'warehouses',
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
