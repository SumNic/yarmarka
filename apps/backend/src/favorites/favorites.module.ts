import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorite } from 'src/common/models/Favorite.model';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [SequelizeModule.forFeature([Favorite])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
