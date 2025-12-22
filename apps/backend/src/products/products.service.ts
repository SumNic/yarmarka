import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from 'src/common/models/Product.model';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product) private productRepo: typeof Product) {}

  async create(dto: CreateProductDto) {
    return this.productRepo.create(dto as any);
  }

  findAll() {
    return this.productRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.productRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Product not found');
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    const entity = await this.findOne(id);
    await entity.update(dto as any);
    return entity;
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await entity.destroy();
    return { deleted: true };
  }
}
