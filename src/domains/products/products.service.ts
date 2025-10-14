import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { CreateProductDto } from './dto/create-product.dto';
import { SearchAndPaginateProductDto } from './dto/query-and-paginate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.repo.findOne({
      where: { sku: dto.sku },
    });

    if (exists) {
      throw new BadRequestException('Product with this SKU already exists');
    }

    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async searchAndFindBy(query: SearchAndPaginateProductDto) {
    const {
      search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo.createQueryBuilder('products').where('1=1');

    if (search_query) {
      qb.andWhere('products.name ILIKE :search_query', {
        search_query: `%${search_query}%`,
      })
        .orWhere('products.sku ILIKE :search_query', {
          search_query: `%${search_query}%`,
        })
        .orWhere('products.description ILIKE :search_query', {
          search_query: `%${search_query}%`,
        });
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

  async findByIdOrFail(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findByIdOrFail(id);

    if (dto.sku && dto.sku !== product.sku) {
      const exists = await this.repo.exists({
        where: { sku: dto.sku, id: Not(id) },
      });

      if (exists) {
        throw new BadRequestException('Product with this SKU already exists');
      }
    }

    await this.repo.update(id, dto);

    return this.findByIdOrFail(id);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findByIdOrFail(id);

    await this.repo.remove(product);
  }
}
