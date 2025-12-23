import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resume } from 'src/common/models/Resume.model';
import { CreateResumeDto } from 'src/resumes/dto/create-resume.dto';
import { UpdateResumeDto } from 'src/resumes/dto/update-resume.dto';
import type { Actor } from 'src/common/auth/permissions';
import { assertCanManageOwnedResource } from 'src/common/auth/permissions';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume) private resumeRepo: typeof Resume) {}

  async create(userId: number, dto: CreateResumeDto) {
    return this.resumeRepo.create({
      ...(dto as any),
      userId,
    });
  }

  findAll() {
    return this.resumeRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.resumeRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Resume not found');
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

  async update(actor: Actor, id: number, dto: UpdateResumeDto) {
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
