import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { ProductSupplier } from './entities/product-supplier.entity';

@Injectable()
export class ProductSuppliersService {
  constructor(
    @InjectRepository(ProductSupplier)
    private repo: Repository<ProductSupplier>,
  ) {}

  async create(dto: CreateProductSupplierDto) {
    const productSupplier = this.repo.create(dto);
    return this.repo.save(productSupplier);
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
}
