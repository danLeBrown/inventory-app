import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { ProductSuppliersService } from '../inventory/product-suppliers.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { QueryAndPaginatePurchaseOrderDto } from './dto/query-and-paginate-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLog } from './entities/purchase-order-log.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly repo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderLog)
    private readonly logRepo: Repository<PurchaseOrderLog>,
    private warehousesService: WarehousesService,
    private productSuppliersService: ProductSuppliersService,
  ) {}

  async create(dto: CreatePurchaseOrderDto) {
    await this.warehousesService.findOneOrFail(dto.warehouse_id);

    const productSupplier = await this.productSuppliersService.findOneByOrFail({
      product_id: dto.product_id,
      supplier_id: dto.supplier_id,
    });

    // TODO: check if pending purchase order already exists
    const pending = await this.repo.findOne({
      where: {
        product_id: dto.product_id,
        warehouse_id: dto.warehouse_id,
        status: 'pending',
      },
    });

    if (pending) {
      await this.repo.delete(pending.id);
    }

    const purchaseOrder = this.repo.create({
      product_id: dto.product_id,
      supplier_id: dto.supplier_id,
      warehouse_id: dto.warehouse_id,
      quantity_ordered: dto.quantity_ordered,
      expected_to_arrive_at: getUnixTime(
        addDays(new Date(), productSupplier.lead_time_in_days),
      ),
    });

    return this.repo.save(purchaseOrder);
  }

  async searchAndFindBy(query: QueryAndPaginatePurchaseOrderDto) {
    const {
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo.createQueryBuilder('products').where('1=1');

    if (query.supplier_id) {
      qb.andWhere('products.supplier_id = :supplier_id', {
        supplier_id: query.supplier_id,
      });
    }
    if (query.warehouse_id) {
      qb.andWhere('products.warehouse_id = :warehouse_id', {
        warehouse_id: query.warehouse_id,
      });
    }
    if (query.product_id) {
      qb.andWhere('products.product_id = :product_id', {
        product_id: query.product_id,
      });
    }

    if (query.status) {
      qb.andWhere('products.status = :status', { status: query.status });
    }

    if (from_time) {
      qb.andWhere('products.created_at >= :from_time', { from_time });
    }
    if (to_time) {
      qb.andWhere('products.created_at <= :to_time', { to_time });
    }

    qb.orderBy(
      `products.${order_by}`,
      order_direction.toUpperCase() as 'ASC' | 'DESC',
    );

    if (limit) {
      qb.limit(limit);
    }
    if (page && limit) {
      qb.offset((page - 1) * limit);
    }

    return qb.getManyAndCount();
  }

  async findByIdOrFail(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.repo.findOne({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    return purchaseOrder;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    await this.findByIdOrFail(id);

    await this.repo.update(id, dto);

    return this.findByIdOrFail(id);
  }

  async updateAsReceived(id: string) {
    const purchaseOrder = await this.findByIdOrFail(id);

    if (purchaseOrder.status !== 'pending') {
      throw new BadRequestException(
        'Only pending purchase orders can be marked as received',
      );
    }

    // Mark the purchase order as completed
    await this.repo.update(id, { status: 'completed' });

    await this.logRepo.save(
      this.logRepo.create({
        purchase_order_id: id,
        group: 'status',
        tag: 'completed_at',
        value: String(getUnixTime(new Date())),
      }),
    );
  }

  async updateAsCancelled(id: string) {
    const purchaseOrder = await this.findByIdOrFail(id);

    if (purchaseOrder.status !== 'pending') {
      throw new BadRequestException(
        'Only pending purchase orders can be cancelled',
      );
    }

    // Mark the purchase order as cancelled
    await this.repo.update(id, { status: 'cancelled' });

    await this.logRepo.save(
      this.logRepo.create({
        purchase_order_id: id,
        group: 'status',
        tag: 'cancelled_at',
        value: String(getUnixTime(new Date())),
      }),
    );
  }

  async findHistory(purchase_order_id: string) {
    return this.logRepo.find({
      where: { purchase_order_id },
      order: { created_at: 'DESC' },
    });
  }

  async findBy(query?: FindOptionsWhere<PurchaseOrder>) {
    return this.repo.find({ where: query });
  }
}
