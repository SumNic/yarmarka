import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resume } from 'src/common/models/Resume.model';
import { CreateResumeDto } from 'src/resumes/dto/create-resume.dto';
import { UpdateResumeDto } from 'src/resumes/dto/update-resume.dto';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume) private resumeRepo: typeof Resume) {}

  async create(dto: CreateResumeDto) {
    return this.resumeRepo.create(dto as any);
  }

  findAll() {
    return this.resumeRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.resumeRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Resume not found');
    return entity;
  }

  async update(id: number, dto: UpdateResumeDto) {
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
