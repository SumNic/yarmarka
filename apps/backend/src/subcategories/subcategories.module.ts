import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subcategory } from 'src/common/models/Subcategory.model';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';

@Module({
  imports: [SequelizeModule.forFeature([Subcategory])],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
