import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateProducts1760408106657 implements MigrationInterface {
  private tableName = 'products';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'sku',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'description',
      type: 'text',
    }),
    new TableColumn({
      name: 'reorder_threshold',
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
      name: 'idx_products_sku',
      columnNames: ['sku'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_products_name',
      columnNames: ['name'],
    }),
    new TableIndex({
      name: 'idx_products_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_products_updated_at',
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
