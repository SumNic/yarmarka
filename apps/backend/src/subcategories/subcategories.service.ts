import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subcategory, CategoryType } from 'src/common/models/Subcategory.model';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(Subcategory) private subcategoryModel: typeof Subcategory,
  ) {}

  async create(subcategories: Partial<Subcategory>[]): Promise<Subcategory[]> {
    return this.subcategoryModel.bulkCreate(subcategories as any);
  }

  async findAll(type?: CategoryType): Promise<Subcategory[]> {
    const where = type ? { type } : {};
    return this.subcategoryModel.findAll({ where, order: [['name', 'ASC']] });
  }

  async findByType(type: CategoryType): Promise<Subcategory[]> {
    return this.subcategoryModel.findAll({
      where: { type },
      order: [['name', 'ASC']],
    });
  }

  async getCustomByType(type: CategoryType): Promise<Subcategory[]> {
    return this.subcategoryModel.findAll({
      where: { type, isCustom: true },
      order: [['name', 'ASC']],
    });
  }
}
