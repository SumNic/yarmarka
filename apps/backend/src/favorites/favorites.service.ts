import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Favorite } from 'src/common/models/Favorite.model';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite)
    private favoriteModel: typeof Favorite,
  ) {}

  async addToProduct(userId: number, productId: number): Promise<Favorite> {
    const [favorite] = await this.favoriteModel.findOrCreate({
      where: { userId, productId },
      defaults: { userId, productId },
    });
    return favorite;
  }

  async addToService(userId: number, serviceId: number): Promise<Favorite> {
    const [favorite] = await this.favoriteModel.findOrCreate({
      where: { userId, serviceId },
      defaults: { userId, serviceId },
    });
    return favorite;
  }

  async addToJob(userId: number, jobId: number): Promise<Favorite> {
    const [favorite] = await this.favoriteModel.findOrCreate({
      where: { userId, jobId },
      defaults: { userId, jobId },
    });
    return favorite;
  }

  async removeFromProduct(userId: number, productId: number): Promise<void> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, productId },
    });
    if (favorite) {
      await favorite.destroy();
    }
  }

  async removeFromService(userId: number, serviceId: number): Promise<void> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, serviceId },
    });
    if (favorite) {
      await favorite.destroy();
    }
  }

  async removeFromJob(userId: number, jobId: number): Promise<void> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, jobId },
    });
    if (favorite) {
      await favorite.destroy();
    }
  }

  async isProductFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, productId },
    });
    return !!favorite;
  }

  async isServiceFavorite(userId: number, serviceId: number): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, serviceId },
    });
    return !!favorite;
  }

  async isJobFavorite(userId: number, jobId: number): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({
      where: { userId, jobId },
    });
    return !!favorite;
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteModel.findAll({
      where: { userId },
    });
  }
}
