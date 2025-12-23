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
    return this.serviceRepo.create({
      ...(dto as any),
      userId,
    });
  }

  findAll() {
    return this.serviceRepo.findAll();
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
    await entity.update(dto as any);
    return entity;
  }

  async remove(actor: Actor, id: number) {
    const entity = await this.findOneForActor(actor, id);
    await entity.destroy();
    return { deleted: true };
  }
}
