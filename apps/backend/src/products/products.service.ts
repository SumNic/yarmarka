import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from 'src/common/models/Product.model';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import type { Actor } from 'src/common/auth/permissions';
import { assertCanManageOwnedResource } from 'src/common/auth/permissions';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product) private productRepo: typeof Product) {}

  async create(userId: number, dto: CreateProductDto) {
    const photoUrls = Array.isArray(dto.photoUrls)
      ? dto.photoUrls.slice(0, 10)
      : [];

    return this.productRepo.create({
      ...(dto as any),
      userId,
      photoUrls,
    });
  }

  findAll() {
    return this.productRepo.findAll();
  }

  findByUserId(userId: number) {
    return this.productRepo.findAll({ where: { userId } });
  }

  async findOne(id: number) {
    const entity = await this.productRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Product not found');
    return entity;
  }

  async findOneForActor(actor: Actor, id: number) {
    const entity = await this.findOne(id);

    assertCanManageOwnedResource({
      actor,
      ownerId: entity.userId,
      errorMessage: 'Недостаточно прав',
    });

    return entity;
  }

  async update(actor: Actor, id: number, dto: UpdateProductDto) {
    const entity = await this.findOneForActor(actor, id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const patch: any = {};

    // Copy only defined fields from dto
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.price !== undefined) patch.price = dto.price;
    if (dto.photoUrls !== undefined) {
      const normalizedPhotoUrls = Array.isArray(dto.photoUrls)
        ? dto.photoUrls.slice(0, 10)
        : [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      patch.photoUrls = normalizedPhotoUrls;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await entity.update(patch);
    return entity;
  }

  async remove(actor: Actor, id: number) {
    const entity = await this.findOneForActor(actor, id);
    await entity.destroy();
    return { deleted: true };
  }
}
