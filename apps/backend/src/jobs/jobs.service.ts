import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'src/common/models/Job.model';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job) private jobRepo: typeof Job) {}

  async create(dto: CreateJobDto) {
    return this.jobRepo.create(dto as any);
  }

  findAll() {
    return this.jobRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.jobRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Job not found');
    return entity;
  }

  async update(id: number, dto: UpdateJobDto) {
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
