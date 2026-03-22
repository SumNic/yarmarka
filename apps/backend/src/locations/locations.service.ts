import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Location } from 'src/common/models/Location.model';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location) private locationModel: typeof Location,
  ) {}

  async create(locations: Partial<Location>[]): Promise<Location[]> {
    return this.locationModel.bulkCreate(locations as any);
  }

  async findAll(): Promise<Location[]> {
    return this.locationModel.findAll({
      order: [['country', 'ASC'], ['region', 'ASC'], ['locality', 'ASC']],
    });
  }

  async getCountries(): Promise<string[]> {
  const result = await this.locationModel.findAll({
    attributes: ['country'],
    group: ['country'],
    order: [['country', 'ASC']],
    raw: true,
  });

  return result
    .map(r => r.country)
    .filter((v): v is string => Boolean(v));
}

async getRegionsByCountry(country: string): Promise<string[]> {
  const result = await this.locationModel.findAll({
    attributes: ['region'],
    where: { country },
    group: ['region'],
    order: [['region', 'ASC']],
    raw: true,
  });

  return result
    .map(r => r.region)
    .filter((v): v is string => Boolean(v));
}

async getLocalitiesByRegion(country: string, region: string): Promise<string[]> {
  const result = await this.locationModel.findAll({
    attributes: ['locality'],
    where: { country, region },
    group: ['locality'],
    order: [['locality', 'ASC']],
    raw: true,
  });

  return result
    .map(r => r.locality)
    .filter((v): v is string => Boolean(v));
}

  async findOne(id: number): Promise<Location> {
    const location = await this.locationModel.findByPk(id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  async delete(id: number): Promise<void> {
    const location = await this.findOne(id);
    await location.destroy();
  }
}
