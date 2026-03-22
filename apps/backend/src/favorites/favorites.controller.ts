import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: { id: number };
  cookies: Record<string, string>;
}

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post('/products/:id')
  async addProduct(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    return this.favoritesService.addToProduct(userId, id);
  }

  @Delete('/products/:id')
  async removeProduct(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    await this.favoritesService.removeFromProduct(userId, id);
    return { success: true };
  }

  @Get('/products/:id/check')
  async checkProduct(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    const isFavorite = await this.favoritesService.isProductFavorite(userId, id);
    return { isFavorite };
  }

  @Post('/services/:id')
  async addService(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    return this.favoritesService.addToService(userId, id);
  }

  @Delete('/services/:id')
  async removeService(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    await this.favoritesService.removeFromService(userId, id);
    return { success: true };
  }

  @Get('/services/:id/check')
  async checkService(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    const isFavorite = await this.favoritesService.isServiceFavorite(userId, id);
    return { isFavorite };
  }

  @Post('/jobs/:id')
  async addJob(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    return this.favoritesService.addToJob(userId, id);
  }

  @Delete('/jobs/:id')
  async removeJob(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    await this.favoritesService.removeFromJob(userId, id);
    return { success: true };
  }

  @Get('/jobs/:id/check')
  async checkJob(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    const isFavorite = await this.favoritesService.isJobFavorite(userId, id);
    return { isFavorite };
  }
}
