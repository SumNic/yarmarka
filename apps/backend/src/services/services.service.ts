import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Service } from 'src/common/models/Service.model';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { UpdateServiceDto } from 'src/services/dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service) private serviceRepo: typeof Service) {}

  async create(dto: CreateServiceDto) {
    return this.serviceRepo.create(dto as any);
  }

  findAll() {
    return this.serviceRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.serviceRepo.findByPk(id);
    if (!entity) throw new NotFoundException('Service not found');
    return entity;
  }

  async update(id: number, dto: UpdateServiceDto) {
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
