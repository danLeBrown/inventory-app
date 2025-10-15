import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { ProductSupplier } from './entities/product-supplier.entity';

@Injectable()
export class ProductSuppliersService {
  constructor(
    @InjectRepository(ProductSupplier)
    private repo: Repository<ProductSupplier>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateProductSupplierDto) {
    const exists = await this.repo.findOne({
      where: {
        product_id: dto.product_id,
        supplier_id: dto.supplier_id,
      },
    });

    if (exists) {
      await this.eventEmitter.emitAsync('product.supplier.created', dto);
      return exists;
    }

    const productSupplier = this.repo.create(dto);
    const exe = await this.repo.save(productSupplier);

    await this.eventEmitter.emitAsync('product.supplier.created', dto);

    return exe;
  }

  async findOneBy(query: FindOptionsWhere<ProductSupplier>) {
    return this.repo.findOne({ where: query });
  }

  async findOneByOrFail(query: FindOptionsWhere<ProductSupplier>) {
    const productSupplier = await this.findOneBy(query);

    if (!productSupplier) {
      throw new NotFoundException('Product Supplier not found');
    }

    return productSupplier;
  }

  async findBy(query?: FindOptionsWhere<ProductSupplier>) {
    return this.repo.find({ where: query });
  }

  async findDefaultSupplierForProduct(product_id: string) {
    const suppliers = await this.repo.find({
      where: { product_id },
      order: { created_at: 'DESC' },
    });

    const defaultSupplier = suppliers.find((s) => s.is_default);
    if (defaultSupplier) {
      return defaultSupplier;
    }

    if (suppliers.length === 0) {
      return null;
    }

    return suppliers[0];
  }

  async updateAsDefault(dto: CreateProductSupplierDto) {
    if (dto.is_default !== true) {
      return;
    }

    await this.repo.manager.transaction(async (manager) => {
      await manager.update(
        ProductSupplier,
        { product_id: dto.product_id, is_default: true },
        { is_default: false },
      );

      await manager.update(
        ProductSupplier,
        {
          product_id: dto.product_id,
          supplier_id: dto.supplier_id,
        },
        { is_default: true },
      );
    });
  }
}
