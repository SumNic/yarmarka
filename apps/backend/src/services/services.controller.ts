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
import { ServicesService } from 'src/services/services.service';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { UpdateServiceDto } from 'src/services/dto/update-service.dto';
import { S3Service } from 'src/common/services/s3.service';
import { UploadResultDto } from 'src/common/dto/upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Услуги')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({ summary: 'Создание услуги' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Услуга создана' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Загрузить фото услуги (до 10 шт.)' })
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
  async uploadServicePhotos(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const service = await this.servicesService.findOneForActor(req.user!, id);

    const uploads = await Promise.all(
      (files ?? []).slice(0, 10).map((file) =>
        this.s3Service.uploadPublicImage({
          folder: `services/${id}`,
          file,
        }),
      ),
    );

    const photoUrls = service.photoUrls;
    const existing = Array.isArray(photoUrls) ? photoUrls : [];

    const merged = [...existing, ...uploads.map((u) => u.url)].slice(0, 10);

    await this.servicesService.update(req.user!, id, {
      photoUrls: merged,
    } as any);

    return uploads.map((u) => ({ key: u.key, url: u.url }));
  }

  @ApiOperation({ summary: 'Список услуг' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список услуг' })
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @ApiOperation({ summary: 'Мои услуги' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список услуг пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Req() req: RequestWithUser) {
    return this.servicesService.findByUserId(req.user!.id);
  }

  @ApiOperation({ summary: 'Получить услугу по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Услуга не найдена',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга обновлена' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга удалена' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(req.user!, id);
  }
}
