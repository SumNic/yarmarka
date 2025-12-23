import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from 'src/products/products.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { S3Service } from 'src/common/services/s3.service';
import { UploadResultDto } from 'src/common/dto/upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  
  @ApiOperation({ summary: 'Создание товара' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Товар создан' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Загрузить фото товара (до 10 шт.)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: [UploadResultDto] })
  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadProductPhotos(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const product = await this.productsService.findOneForActor(req.user!, id);

    const uploads = await Promise.all(
      (files ?? []).slice(0, 10).map((file) =>
        this.s3Service.uploadPublicImage({
          folder: `products/${id}`,
          file,
        }),
      ),
    );

    const photoUrls = product.photoUrls;
    const existing = Array.isArray(photoUrls) ? photoUrls : [];

    const merged = [...existing, ...uploads.map((u) => u.url)].slice(0, 10);

    await this.productsService.update(req.user!, id, {
      photoUrls: merged,
    } as any);

    return uploads.map((u) => ({ key: u.key, url: u.url }));
  }

  @ApiOperation({ summary: 'Список товаров' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список товаров' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Получить товар по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Товар не найден' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар обновлён' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить товар' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар удалён' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(req.user!, id);
  }
}
