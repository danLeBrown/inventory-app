import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SearchAndPaginateSupplierDto } from './dto/query-and-paginate-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto) {
    const supplier = this.repo.create(dto);
    return this.repo.save(supplier);
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findOneOrFail(id: string) {
    const supplier = await this.findOne(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async searchAndFindBy(query: SearchAndPaginateSupplierDto) {
    const {
      search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo.createQueryBuilder('suppliers').where('1=1');

    if (search_query) {
      qb.andWhere('suppliers.name ILIKE :search_query', {
        search_query: `%${search_query}%`,
      }).orWhere('suppliers.contact_information ILIKE :search_query', {
        search_query: `%${search_query}%`,
      });
    }

    if (from_time) {
      qb.andWhere('suppliers.created_at >= :from_time', { from_time });
    }
    if (to_time) {
      qb.andWhere('suppliers.created_at <= :to_time', { to_time });
    }

    qb.orderBy(
      `suppliers.${order_by}`,
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

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOneOrFail(id);

    await this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOneOrFail(id);

    await this.repo.delete(id);
  }
}
