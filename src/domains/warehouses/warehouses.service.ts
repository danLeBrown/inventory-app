import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { SearchAndPaginateWarehouseDto } from './dto/query-and-paginate-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto) {
    const warehouse = this.repo.create(dto);
    return this.repo.save(warehouse);
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findOneOrFail(id: string) {
    const warehouse = await this.findOne(id);

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async searchAndFindBy(query: SearchAndPaginateWarehouseDto) {
    const {
      search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo.createQueryBuilder('warehouses').where('1=1');

    if (search_query) {
      qb.andWhere('warehouses.name ILIKE :search_query', {
        search_query: `%${search_query}%`,
      }).orWhere('warehouses.location ILIKE :search_query', {
        search_query: `%${search_query}%`,
      });
    }

    if (from_time) {
      qb.andWhere('warehouses.created_at >= :from_time', { from_time });
    }
    if (to_time) {
      qb.andWhere('warehouses.created_at <= :to_time', { to_time });
    }

    qb.orderBy(
      `warehouses.${order_by}`,
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

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOneOrFail(id);

    await this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOneOrFail(id);

    await this.repo.delete(id);
  }
}
