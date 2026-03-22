import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'src/common/models/Job.model';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dto/update-job.dto';
import type { Actor } from 'src/common/auth/permissions';
import { assertCanManageOwnedResource } from 'src/common/auth/permissions';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job) private jobRepo: typeof Job) {}

  async create(userId: number, dto: CreateJobDto) {
    const photoUrls = Array.isArray(dto.photoUrls)
      ? dto.photoUrls.slice(0, 10)
      : [];

    return this.jobRepo.create({
      ...(dto as any),
      userId,
      photoUrls,
    });
  }

  findAll() {
    return this.jobRepo.findAll();
  }

  findByUserId(userId: number) {
    return this.jobRepo.findAll({ where: { userId } });
  }

  async findOne(id: number) {
    const entity = await this.jobRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Job not found');
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

  async update(actor: Actor, id: number, dto: UpdateJobDto) {
    const entity = await this.findOneForActor(actor, id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const patch: any = {};

    // Copy only defined fields from dto
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.salary !== undefined) patch.salary = dto.salary;
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
