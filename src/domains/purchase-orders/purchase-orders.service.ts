import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { ProductSuppliersService } from '../inventory/product-suppliers.service';
import { ProductsService } from '../products/products.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderFromProductDto,
} from './dto/create-purchase-order.dto';
import { QueryAndPaginatePurchaseOrderDto } from './dto/query-and-paginate-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLog } from './entities/purchase-order-log.entity';
import { decideQuantityAndWareHouse } from './helpers/decide-quantity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly repo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderLog)
    private readonly logRepo: Repository<PurchaseOrderLog>,
    private warehousesService: WarehousesService,
    private productsService: ProductsService,
    private productSuppliersService: ProductSuppliersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePurchaseOrderFromProductDto) {
    const { product_id, quantity_ordered } = dto;

    const product = await this.productsService.findByIdOrFail(product_id);

    const defaultSupplier =
      await this.productSuppliersService.findDefaultSupplierForProduct(
        product_id,
      );

    if (!defaultSupplier) {
      throw new BadRequestException('No default supplier found');
    }

    const warehouses = await this.warehousesService.findAll();

    const pending_purchase_orders = await this.repo.find({
      where: {
        product_id,
        status: 'pending',
      },
    });

    const { quantity, warehouse } = decideQuantityAndWareHouse({
      product_reorder_threshold: product.reorder_threshold,
      warehouses,
      pending_purchase_orders,
      quantity_ordered,
    });

    if (!warehouse) {
      throw new BadRequestException(
        'No warehouse available to receive the purchase order',
      );
    }

    if (quantity < 1) {
      throw new BadRequestException(
        'No more capacity available in the warehouses to receive the purchase order',
      );
    }

    const body = {
      product_id,
      supplier_id: defaultSupplier.supplier_id,
      warehouse_id: warehouse.id,
      quantity_ordered: quantity,
    } satisfies CreatePurchaseOrderDto;

    // TODO: check if pending purchase order already exists
    const pending = await this.repo.findOne({
      where: {
        product_id: body.product_id,
        warehouse_id: body.warehouse_id,
        status: 'pending',
      },
    });

    if (pending) {
      await this.repo.delete(pending.id);
    }

    const purchaseOrder = this.repo.create({
      ...body,
      expected_to_arrive_at: getUnixTime(
        addDays(new Date(), defaultSupplier.lead_time_days),
      ),
      status: 'pending',
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

    const qb = this.repo.createQueryBuilder('product_orders').where('1=1');

    if (query.supplier_id) {
      qb.andWhere('product_orders.supplier_id = :supplier_id', {
        supplier_id: query.supplier_id,
      });
    }
    if (query.warehouse_id) {
      qb.andWhere('product_orders.warehouse_id = :warehouse_id', {
        warehouse_id: query.warehouse_id,
      });
    }
    if (query.product_id) {
      qb.andWhere('product_orders.product_id = :product_id', {
        product_id: query.product_id,
      });
    }

    if (query.status) {
      qb.andWhere('product_orders.status = :status', { status: query.status });
    }

    if (from_time) {
      qb.andWhere('product_orders.created_at >= :from_time', { from_time });
    }
    if (to_time) {
      qb.andWhere('product_orders.created_at <= :to_time', { to_time });
    }

    qb.orderBy(
      `product_orders.${order_by}`,
      order_direction.toUpperCase() as 'ASC' | 'DESC',
    );

    if (limit) {
      qb.limit(limit);
    }
    if (page && limit) {
      qb.offset((page - 1) * limit);
    }

    // load relations
    qb.leftJoinAndSelect('product_orders.product', 'product');
    qb.leftJoinAndSelect('product_orders.supplier', 'supplier');
    qb.leftJoinAndSelect('product_orders.warehouse', 'warehouse');

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

    await this.eventEmitter.emitAsync('purchase-order.received', purchaseOrder);
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
