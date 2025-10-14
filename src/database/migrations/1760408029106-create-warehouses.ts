import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateWarehouses1760408029106 implements MigrationInterface {
  private tableName = 'warehouses';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'location',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'capacity',
      type: 'int',
    }),
    new TableColumn({
      name: 'quantity_in_stock',
      type: 'int',
      default: 0,
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
      name: 'idx_warehouses_name',
      columnNames: ['name'],
    }),
    new TableIndex({
      name: 'idx_warehouses_location',
      columnNames: ['location'],
    }),
    new TableIndex({
      name: 'idx_warehouses_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_warehouses_updated_at',
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
