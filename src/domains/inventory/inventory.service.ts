import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ensureTransaction } from '@/helpers/database';

import { UpdateWarehouseStockDto } from './dto/update-warehouse-stock.dto';
import { WarehouseStock } from './entities/warehouse-stock.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(WarehouseStock)
    private readonly repo: Repository<WarehouseStock>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createOrUpdateStockLevel(data: UpdateWarehouseStockDto) {
    const exe = await ensureTransaction(() =>
      this.repo.manager.transaction(async (manager) => {
        const repo = manager.getRepository(WarehouseStock);
        const warehouseStock = await repo.findOne({
          where: {
            product_id: data.product_id,
            warehouse_id: data.warehouse_id,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (warehouseStock) {
          const stock =
            data.operation === 'add'
              ? data.quantity + warehouseStock.quantity
              : warehouseStock.quantity - data.quantity;

          return repo.update(warehouseStock.id, {
            quantity: Math.max(0, stock),
          });
        }

        const newStock = repo.create({
          product_id: data.product_id,
          warehouse_id: data.warehouse_id,
          quantity: Math.max(0, data.quantity),
        });

        return repo.save(newStock);
      }),
    );

    await this.eventEmitter.emitAsync('inventory.stock.updated', data);

    return exe;
  }

  async findProductStockLevel(query: {
    product_id: string;
    warehouse_id?: string;
  }) {
    const { product_id, warehouse_id } = query;
    const qb = this.repo.createQueryBuilder('warehouse_stocks').where('1=1');

    qb.andWhere('warehouse_stocks.product_id = :product_id', { product_id });

    if (warehouse_id) {
      qb.andWhere('warehouse_stocks.warehouse_id = :warehouse_id', {
        warehouse_id,
      });
    }

    const { sum } = await qb
      .select('SUM(warehouse_stocks.quantity)', 'sum')
      .getRawOne();

    return Number(sum) || 0;
  }
}
