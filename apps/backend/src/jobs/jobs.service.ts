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
    return this.jobRepo.create({
      ...(dto as any),
      userId,
    });
  }

  findAll() {
    return this.jobRepo.findAll();
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
    await entity.update(dto as any);
    return entity;
  }

  async remove(actor: Actor, id: number) {
    const entity = await this.findOneForActor(actor, id);
    await entity.destroy();
    return { deleted: true };
  }
}
