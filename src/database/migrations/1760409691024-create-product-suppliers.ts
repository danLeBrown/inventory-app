import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProductSuppliers1760409691024 implements MigrationInterface {
  private tableName = 'product_suppliers';

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
      name: 'is_default',
      type: 'boolean',
      default: false,
    }),
    new TableColumn({
      name: 'lead_time_days',
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
      name: 'idx_product_suppliers_product_id',
      columnNames: ['product_id'],
    }),
    new TableIndex({
      name: 'idx_product_suppliers_supplier_id',
      columnNames: ['supplier_id'],
    }),
    new TableIndex({
      name: 'idx_product_suppliers_is_default',
      columnNames: ['is_default'],
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
      columnNames: ['supplier_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'suppliers',
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
