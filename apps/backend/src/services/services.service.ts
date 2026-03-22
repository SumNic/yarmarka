import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Service } from 'src/common/models/Service.model';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { UpdateServiceDto } from 'src/services/dto/update-service.dto';
import type { Actor } from 'src/common/auth/permissions';
import { assertCanManageOwnedResource } from 'src/common/auth/permissions';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service) private serviceRepo: typeof Service) {}

  async create(userId: number, dto: CreateServiceDto) {
    const photoUrls = Array.isArray(dto.photoUrls)
      ? dto.photoUrls.slice(0, 10)
      : [];

    return this.serviceRepo.create({
      ...(dto as any),
      userId,
      photoUrls,
    });
  }

  findAll() {
    return this.serviceRepo.findAll();
  }

  findByUserId(userId: number) {
    return this.serviceRepo.findAll({ where: { userId } });
  }

  async findOne(id: number) {
    const entity = await this.serviceRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Service not found');
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

  async update(actor: Actor, id: number, dto: UpdateServiceDto) {
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
